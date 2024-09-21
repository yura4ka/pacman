export class DefaultMap<K, V> {
  private readonly _defaultValue: V;
  private readonly _map: Map<K, V>;

  constructor(defaultValue: V, iterable?: Iterable<readonly [K, V]>) {
    this._defaultValue = defaultValue;
    this._map = new Map(iterable);
  }

  public set(key: K, value: V) {
    return this._map.set(key, value);
  }

  public get(key: K) {
    return this._map.get(key) ?? this._defaultValue;
  }

  public [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
}
