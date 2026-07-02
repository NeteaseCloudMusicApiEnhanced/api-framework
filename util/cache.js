/**
 * 轻量级内存缓存
 */
'use strict'

class MemoryCache {
  constructor(ttl = 120) {
    this._store = new Map()
    this._ttl = ttl * 1000 // 转为毫秒
    this._timer = setInterval(() => this._cleanup(), 60000)
    this._timer.unref()
  }

  /**
   * 获取缓存
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    const item = this._store.get(key)
    if (!item) return undefined
    if (Date.now() > item.expires) {
      this._store.delete(key)
      return undefined
    }
    return item.value
  }

  /**
   * 设置缓存
   * @param {string} key
   * @param {any} value
   * @param {number} [ttl] 自定义 TTL（秒）
   */
  set(key, value, ttl) {
    const expires = Date.now() + (ttl ? ttl * 1000 : this._ttl)
    this._store.set(key, { value, expires })
  }

  /**
   * 删除缓存
   * @param {string} key
   */
  del(key) {
    this._store.delete(key)
  }

  /**
   * 清空缓存
   */
  flush() {
    this._store.clear()
  }

  /**
   * 获取缓存大小
   * @returns {number}
   */
  get size() {
    return this._store.size
  }

  /**
   * 清理过期缓存
   */
  _cleanup() {
    const now = Date.now()
    for (const [key, item] of this._store.entries()) {
      if (now > item.expires) {
        this._store.delete(key)
      }
    }
  }

  /**
   * 销毁缓存（清理定时器）
   */
  destroy() {
    clearInterval(this._timer)
    this._store.clear()
  }
}

/**
 * 中间件工厂 - 返回 Express 缓存中间件
 * @param {number} ttl 缓存时间（秒）
 * @returns {Function}
 */
function cacheMiddleware(ttl = 120) {
  const cache = new MemoryCache(ttl)

  return (req, res, next) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') return next()

    const key = req.originalUrl
    const cached = cache.get(key)

    if (cached) {
      res.json(cached)
      return
    }

    // 劫持 res.json 来缓存响应
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      cache.set(key, body)
      originalJson(body)
    }

    next()
  }
}

module.exports = { MemoryCache, cacheMiddleware }
