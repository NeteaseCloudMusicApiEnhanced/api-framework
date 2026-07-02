/**
 * Lightweight in-memory cache
 */
'use strict'

class MemoryCache {
  constructor(ttl = 120) {
    this._store = new Map()
    this._ttl = ttl * 1000 // convert to ms
    this._timer = setInterval(() => this._cleanup(), 60000)
    this._timer.unref()
  }

  /**
   * Get cached value
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
   * Set cached value
   * @param {string} key
   * @param {any} value
   * @param {number} [ttl] custom TTL (seconds)
   */
  set(key, value, ttl) {
    const expires = Date.now() + (ttl ? ttl * 1000 : this._ttl)
    this._store.set(key, { value, expires })
  }

  /**
   * Delete cached value
   * @param {string} key
   */
  del(key) {
    this._store.delete(key)
  }

  /**
   * Flush all cache
   */
  flush() {
    this._store.clear()
  }

  /**
   * Get cache size
   * @returns {number}
   */
  get size() {
    return this._store.size
  }

  /**
   * Cleanup expired cache
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
   * Destroy cache (clear timer)
   */
  destroy() {
    clearInterval(this._timer)
    this._store.clear()
  }
}

/**
 * Middleware factory - returns Express cache middleware
 * @param {number} ttl cache TTL (seconds)
 * @returns {Function}
 */
function cacheMiddleware(ttl = 120) {
  const cache = new MemoryCache(ttl)

  return (req, res, next) => {
    // only cache GET requests
    if (req.method !== 'GET') return next()

    const key = req.originalUrl
    const cached = cache.get(key)

    if (cached) {
      res.json(cached)
      return
    }

    // intercept res.json to cache response
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      cache.set(key, body)
      originalJson(body)
    }

    next()
  }
}

module.exports = { MemoryCache, cacheMiddleware }
