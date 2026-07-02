/**
 * Generic HTTP request engine (axios wrapper)
 * Supports proxy, cookie forwarding, timeout
 */
'use strict'

const axios = require('axios')
const logger = require('./logger')
const config = require('../config')

/**
 * Send HTTP request
 * @param {string} uri request path (may include query string)
 * @param {object|string} data request body
 * @param {object} [options] request options
 * @param {string} [options.method] HTTP method (GET/POST/PUT/DELETE)
 * @param {object} [options.headers] custom headers
 * @param {object|string} [options.cookie] Cookie
 * @param {string} [options.ua] User-Agent
 * @param {string} [options.proxy] proxy URL
 * @param {string} [options.realIP] real client IP
 * @param {number} [options.timeout] timeout (ms)
 * @param {string} [options.responseType] response type
 * @param {string} [options.baseURL] base URL
 * @returns {Promise<{status: number, body: any, cookie: string[]}>}
 */
async function createRequest(uri, data, options = {}) {
  const method = (options.method || 'POST').toUpperCase()
  const baseURL = options.baseURL || ''
  const url = baseURL ? `${baseURL}${uri}` : uri

  // build headers
  const headers = {
    'User-Agent':
      options.ua ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(options.headers || {}),
  }

  // handle cookie
  if (options.cookie) {
    if (typeof options.cookie === 'string') {
      headers['Cookie'] = options.cookie
    } else if (typeof options.cookie === 'object') {
      headers['Cookie'] = Object.entries(options.cookie)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('; ')
    }
  }

  // handle real IP
  if (options.realIP) {
    headers['X-Real-IP'] = options.realIP
    headers['X-Forwarded-For'] = options.realIP
  }

  // build axios config
  const axiosConfig = {
    method,
    url,
    headers,
    timeout: options.timeout || config.requestTimeout,
    responseType: options.responseType || 'json',
    maxRedirects: 5,
    validateStatus: () => true, // do not throw on HTTP errors
  }

  // request body
  if (method === 'GET') {
    axiosConfig.params = data
  } else {
    axiosConfig.data = data
  }

  // proxy settings
  const proxy = options.proxy || config.proxy
  if (proxy) {
    try {
      const proxyURL = new URL(proxy)
      axiosConfig.proxy = {
        host: proxyURL.hostname,
        port: parseInt(proxyURL.port, 10) || 8080,
        protocol: proxyURL.protocol,
        auth:
          proxyURL.username && proxyURL.password
            ? {
                username: proxyURL.username,
                password: proxyURL.password,
              }
            : undefined,
      }
    } catch (e) {
      logger.warn(`Proxy URL parse failed: ${proxy}`, e.message)
    }
  }

  logger.debug(`[Request] ${method} ${url}`)

  try {
    const response = await axios(axiosConfig)

    const result = {
      status: response.status,
      body: response.data,
      cookie: response.headers['set-cookie'] || [],
    }

    logger.debug(`[Response] ${method} ${url} -> ${response.status}`)
    return result
  } catch (err) {
    logger.error(`[Request Failed] ${method} ${url}`, err.message)

    return {
      status: 502,
      body: { code: 502, msg: err.message || 'Bad Gateway' },
      cookie: [],
    }
  }
}

module.exports = createRequest
