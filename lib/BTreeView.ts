import * as d3_selection from 'd3-selection';
import uniqId from './uniqId';
import './style.css';

type Position = [number, number];

// node节点
type NodeItem<T = any> = {
  readonly [P in keyof T]: T[P];
};
// 默认配置项
const defaultOpt = {
  id: 'tree-view',
  successNodeKey: 'successTradeNode',
  failNodeKey: 'failTradeNode',
  nameKey: 'tradeNodeInstanceName',
  groupKey: 'BelongToGroup',
  minVivewHeight: 600,
  nodeWidth: 120,
  nodeHeight: 50,
  autoDistanceX: 200,
  autoDistanceY: 160,
};

export type Option<T> = {
  id: string;
  colorKey: keyof T | any;
  bgColorKey: keyof T | any;
  successNodeKey?: keyof T;
  failNodeKey?: keyof T;
  nameKey?: keyof T;
  BelongToGroup?: keyof T;
  minVivewHeight?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  autoDistanceX?: number;
  autoDistanceY?: number;
};
type Option2<T> = {
  id: string;
  colorKey: keyof T;
  bgColorKey: keyof T;
  successNodeKey: keyof T;
  failNodeKey: keyof T;
  nameKey: keyof T;
  minVivewHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  autoDistanceX: number;
  autoDistanceY: number;
};
type ClickCB<T> = (nodeItem: T) => any;

const defaultColor = '#111111';
const defaultBgColor = '#ffffff';

class BTreeView<T = any> {
  declare opt: Option2<T>;
  declare box: HTMLElement;
  declare svg: d3_selection.Selection<SVGSVGElement, unknown, null, undefined>;
  declare group: d3_selection.Selection<SVGGElement, unknown, null, undefined>;
  declare pictureL: d3_selection.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;
  declare picture: d3_selection.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;
  declare rootNode: NodeItem<T>;
  clickCBs: ClickCB<T>[] = [];
  nodes: { [key: string]: NodeItem<T> } = {}; // {key: node}节点
  nodePositions: { [key: string]: Position } = {}; // {key: [x,y]} 节点位置
  lines: {
    [key: string]: {
      key: string;
      type: 'success' | 'fail';
      line: Position[];
    }[];
  } = {};
  declare groupTranslate: { x: number; y: number };

  /**
   * 二维数组表示网格盘 500*500()，每一个点表示可以画一个node,
   * 一个点只能承载一个node节点，
   * 连线不能经过node节点
   * node也不能放在连线经过的地方
   */
  checkerboard: boolean[][] = new Array(500).fill(new Array(500));

  constructor(opt: Option<T>) {
    // this.rootNode = {}
    this.opt = Object.assign({}, defaultOpt, opt); //配置项
    this.box = document.getElementById(this.opt.id); //容器
    this.box.style.display = 'block';
    this.box.style.padding = '0px';
    this.box.style.overflowX = 'auto';
    this.initSvg();
    this.groupTranslate = { x: this.opt.nodeWidth, y: this.opt.nodeHeight };
    const { x, y } = this.groupTranslate;
    this.group = this.svg
      .append('g')
      .classed('g-board', true)
      .attr('transform', `translate(${x},${y})`); //组
    this.pictureL = this.group.append('g').classed('p-board-l', true); //画 连线
    this.picture = this.group.append('g').classed('p-board', true); //画 节点
  }
  initSvg() {
    let h = this.box.offsetHeight;
    this.box.style.minHeight =
      (h > this.opt.minVivewHeight ? h : this.opt.minVivewHeight) + 'px';
    this.svg = d3_selection
      .select(this.box)
      .append('svg') //画板
      .classed('c_tree_svg', true)
      .attr('width', this.box.offsetWidth)
      .attr('height', this.box.offsetHeight);
    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('viewBox', '0 0 12 12')
      .attr('refX', 6)
      .attr('refY', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2')
      .style('fill', '#000000');
  }
  resizeSvg() {
    const { nodeWidth, nodeHeight } = this.opt;
    var g: SVGGElement = this.box.querySelector('.g-board');
    let rect = g.getBBox();
    this.svg.attr('width', rect.width + nodeWidth);
    this.svg.attr('height', rect.height + nodeHeight);
  }
  onNodeClict(cb: ClickCB<T>) {
    this.clickCBs.push(cb);
  }
  /**
   * 加载数据，数据加工到 this.nodes, 生成每个节点的位置信息存放在this.nodePositions
   * @param tree
   */
  loadTree(treeNode: T) {
    this.checkerboard = new Array(500).fill(new Array(500)); // 清理标记盘
    this.nodes = {};
    this.nodePositions = {};
    this.lines = {};
    this.picture.selectAll('*').remove();
    this.pictureL.selectAll('*').remove();
    // TODO: 清理相关数据

    // this.calculateSubNodeCount(treeNode);
    // console.log(treeNode);
    const pos: Position = [0, 0];
    this.loadNode(treeNode, pos);
    this.drawNodes();
    this.drowLines();
    setTimeout(() => {
      this.resizeSvg();
    }, 0);
  }
  loadNode(treeNode: NodeItem<T>, pos: Position) {
    const [px, py] = pos;
    this.checkerboard[px][py] = true;

    const key = 'n' + uniqId();
    this.nodes[key] = treeNode;
    this.nodePositions[key] = pos;
    const { successNodeKey, failNodeKey } = this.opt;
    let successTradeNode = (treeNode[successNodeKey] as any) as
      | NodeItem<T>
      | undefined;
    let failTradeNode = (treeNode[failNodeKey] as any) as
      | NodeItem<T>
      | undefined;

    this.lines[key] = [];
    if (failTradeNode) {
      // 优先布局错误节点，所以错误节点不用担心 位置上回覆盖别的节点以及别的节点连线
      this.checkerboard[px + 1][py] = true; // 连线 向右

      this.lines[key].push({
        type: 'fail',
        key,
        line: [
          [px, py],
          [px + 1, py],
          [px + 1, py + 1],
        ],
      });
      this.loadNode(failTradeNode, [px + 1, py + 1]); // 节点 向右再向下
    }
    if (successTradeNode) {
      let spx = px;
      let spy = py + 1;
      let linePoints: Position[] = [
        [px, py],
        [spx, spy],
      ];
      if (successTradeNode[failNodeKey]) {
        // 如果该节点有 失败子节点，那它就要考虑向右一格是否有空间
        while (this.checkerboard[spx + 1][spy]) {
          // 逻辑就是：如果右一格已被占用，我就向下移动一格，再判断，直到右边一格没有被占用
          spy++;
          linePoints.push([spx, spy]);
        }
      }
      this.lines[key].push({
        key,
        type: 'fail',
        line: linePoints,
      });
      this.loadNode(successTradeNode, [spx, spy]);
    }
  }
  drawNodes() {
    const { nodeWidth, nodeHeight, autoDistanceX, autoDistanceY } = this.opt;
    let rects = this.picture
      .selectAll('rect')
      .data(Object.keys(this.nodes))
      .enter()
      .append('rect')
      .attr('class', (key) => key)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', (key) => {
        const position = this.nodePositions[key];
        const { nodeWidth } = this.opt;
        const [x] = position;
        const px = x * autoDistanceX - Math.floor(nodeWidth / 2);

        return px;
      })
      .attr('y', (key) => {
        const position = this.nodePositions[key];
        const { nodeHeight } = this.opt;
        const [_, y] = position;
        const py = y * autoDistanceY - Math.floor(nodeHeight / 2);
        return py;
      })
      .attr('rx', 6)
      .attr('ry', 6)
      .style('stroke', (key) => {
        const node = this.nodes[key];
        return (node[this.opt.colorKey] as any) || defaultColor;
      })
      .style('fill', (key) => {
        const node = this.nodes[key];
        return (node[this.opt.bgColorKey] as any) || defaultBgColor;
      })
      .style('stroke-width', 2);

    let texts = this.picture
      .selectAll('foreignObject')
      .data(Object.keys(this.nodes))
      .enter()
      .append('foreignObject')
      .attr('data-key', (key) => key)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', (key) => {
        const position = this.nodePositions[key];
        const { nodeWidth } = this.opt;
        const [x] = position;
        const px = x * autoDistanceX - Math.floor(nodeWidth / 2);

        return px;
      })
      .attr('y', (key) => {
        const position = this.nodePositions[key];
        const { nodeHeight } = this.opt;
        const [_, y] = position;
        const py = y * autoDistanceY - Math.floor(nodeHeight / 2);
        return py;
      })
      .html((key: string) => {
        const node = this.nodes[key];
        const text = node[this.opt.nameKey];
        return `<div class="c_tree_node_text ${key}" style="line-height:${nodeHeight}px; color:${
          node[this.opt.colorKey] || defaultColor
        }" title="${text}">${text}</div>`;
      })
      .on('click', (_, key) => {
        // console.log('click', key);
        const node = this.nodes[key];
        this.clickCBs.forEach((cb) => {
          cb(node);
        });
      });

    // .append('div')
    // .text();
    // console.log(text);
  }
  drowLines() {
    const { nodeWidth, nodeHeight, autoDistanceX, autoDistanceY } = this.opt;
    const lineData = Object.values(this.lines).reduce((total, cur) => {
      total = total.concat(cur);
      return total;
    }, []);
    const lines = this.pictureL
      .selectAll('polyline')
      .data(lineData)
      .enter()
      .append('polyline')
      .style('stroke-width', 2)
      .style('stroke', '#000000')
      .style('fill', 'none')
      .attr('class', (d) => {
        return `line-${d.key} line-${d.type}`;
      })
      .attr('marker-end', 'url(#arrow)')
      .attr('points', (d) => {
        const points = d.line.map((pos) => {
          return [pos[0] * autoDistanceX, pos[1] * autoDistanceY];
        });
        const lostPos = points[points.length - 1];
        lostPos[1] = lostPos[1] - Math.floor(nodeHeight / 2) - 8;
        return points.join(' ');
      });
  }
  destroyed() {
    this.clickCBs = [];
  }
}

export default BTreeView;
