/**
 * Created by weijianli on 16/6/16.
 *
 * 造一种多对多的无重复数据容器,来存储节点之间的连线关系
 */
declare class netMap<A = any, B = any> {
    _abMap: Map<A, Set<B>>;
    _baMap: Map<B, Set<A>>;
    constructor();
    set(key: A, value: B): boolean;
    getValuesByKey(key: A): B[];
    getKeysByValue(value: B): A[];
    delValuesBykey(key: A): boolean;
    delKeysByValue(value: B): boolean;
}
export default netMap;
