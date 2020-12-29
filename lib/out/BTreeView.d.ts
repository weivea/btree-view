import * as d3_selection from 'd3-selection';
import './style.css';
declare type Position = [number, number];
declare type NodeItem<T = any> = {
    readonly [P in keyof T]: T[P];
};
export declare type Option<T> = {
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
declare type Option2<T> = {
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
declare type ClickCB<T> = (nodeItem: T) => any;
declare class BTreeView<T = any> {
    opt: Option2<T>;
    box: HTMLElement;
    svg: d3_selection.Selection<SVGSVGElement, unknown, null, undefined>;
    group: d3_selection.Selection<SVGGElement, unknown, null, undefined>;
    pictureL: d3_selection.Selection<SVGGElement, unknown, null, undefined>;
    picture: d3_selection.Selection<SVGGElement, unknown, null, undefined>;
    rootNode: NodeItem<T>;
    clickCBs: ClickCB<T>[];
    nodes: {
        [key: string]: NodeItem<T>;
    };
    nodePositions: {
        [key: string]: Position;
    };
    lines: {
        [key: string]: {
            key: string;
            type: 'success' | 'fail';
            line: Position[];
        }[];
    };
    groupTranslate: {
        x: number;
        y: number;
    };
    /**
     * 二维数组表示网格盘 500*500()，每一个点表示可以画一个node,
     * 一个点只能承载一个node节点，
     * 连线不能经过node节点
     * node也不能放在连线经过的地方
     */
    checkerboard: boolean[][];
    constructor(opt: Option<T>);
    initSvg(): void;
    resizeSvg(): void;
    onNodeClict(cb: ClickCB<T>): void;
    /**
     * 加载数据，数据加工到 this.nodes, 生成每个节点的位置信息存放在this.nodePositions
     * @param tree
     */
    loadTree(treeNode: T): void;
    loadNode(treeNode: NodeItem<T>, pos: Position): void;
    drawNodes(): void;
    drowLines(): void;
    destroyed(): void;
}
export default BTreeView;
