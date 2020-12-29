/**
 * Created by weijianli on 16/6/16.
 *
 * 造一种多对多的无重复数据容器,来存储节点之间的连线关系
 */

class netMap<A = any, B = any> {
  declare _abMap: Map<A, Set<B>>;
  declare _baMap: Map<B, Set<A>>;
  constructor() {
    this._abMap = new Map(); //节点连线关系网,去向的关系
    this._baMap = new Map(); //节点连线关系网
  }
  set(key: A, value: B) {
    if (!key || !value) {
      return false;
    }
    if (!this._abMap.has(key)) {
      this._abMap.set(key, new Set());
    }
    this._abMap.get(key).add(value);
    if (!this._baMap.has(value)) {
      this._baMap.set(value, new Set());
    }
    this._baMap.get(value).add(key);
    return true;
  }
  getValuesByKey(key: A) {
    if (this._abMap.has(key)) {
      return Array.from(this._abMap.get(key));
    } else {
      return [];
    }
  }
  getKeysByValue(value: B) {
    if (this._baMap.has(value)) {
      return Array.from(this._baMap.get(value));
    } else {
      return [];
    }
  }
  delValuesBykey(key: A) {
    var self = this;
    if (!this._abMap.has(key)) {
      return false;
    }
    var _set = this._abMap.get(key);
    _set.forEach(function (item) {
      self._baMap.get(item).delete(key);
      if (self._baMap.get(item).size == 0) {
        self._baMap.delete(item);
      }
    });

    this._abMap.delete(key);
    return true;
  }
  delKeysByValue(value: B) {
    var self = this;
    if (!this._baMap.has(value)) {
      return false;
    }
    var _set = this._baMap.get(value);
    _set.forEach(function (item) {
      self._abMap.get(item).delete(value);
      if (self._abMap.get(item).size == 0) {
        self._abMap.delete(item);
      }
    });
    this._baMap.delete(value);
    return true;
  }
}

export default netMap;
