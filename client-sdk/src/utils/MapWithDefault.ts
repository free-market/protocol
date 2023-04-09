export class MapWithDefault<K, V> extends Map<K, V> {
  factory: (key: K) => V
  constructor(factory: (key: K) => V) {
    super()
    this.factory = factory
  }
  getWithDefault(key: K): V {
    let val = this.get(key)
    if (!val) {
      val = this.factory(key)
      this.set(key, val)
    }
    return val
  }
}
