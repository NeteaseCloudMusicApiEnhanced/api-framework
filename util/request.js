/**
 * 通用 HTTP 请求引擎 (axios 封装)
 * 支持代理、Cookie 透传、超时设置
 */
'use strict'

const axios = require('axios')
const logger = require('./logger')
const config = require('../config')

/**
 * 发送 HTTP 请求
 * @param {string} uri 请求路径（可包含 query string）
 * @param {object|string} data 请求体数据
 * @param {object} [options] 请求选项
 * @param {string} [options.method] HTTP 方法 (GET/POST/PUT/DELETE)
 * @param {object} [options.headers] 自定义请求头
 * @param {object|string} [options.cookie] Cookie
 * @param {string} [options.ua] User-Agent
 * @param {string} [options.proxy] 代理地址
 * @param {string} [options.realIP] 真实 IP
 * @param {number} [options.timeout] 超时时间 (ms)
 * @param {string} [options.responseType] 响应类型
 * @param {string} [options.baseURL] 基础 URL
 * @returns {Promise<{status: number, body: any, cookie: string[]}>}
 */
async function createRequest(uri, data, options = {}) {
  const method = (options.method || 'POST').toUpperCase()
  const baseURL = options.baseURL || ''
  const url = baseURL ? `${baseURL}${uri}` : uri

  // 构建请求头
  const headers = {
    'User-Agent':
      options.ua ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(options.headers || {}),
  }

  // 处理 Cookie
  if (options.cookie) {
    if (typeof options.cookie === 'string') {
      headers['Cookie'] = options.cookie
    } else if (typeof options.cookie === 'object') {
      headers['Cookie'] = Object.entries(options.cookie)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('; ')
    }
  }

  // 处理真实 IP
  if (options.realIP) {
    headers['X-Real-IP'] = options.realIP
    headers['X-Forwarded-For'] = options.realIP
  }

  // 构建 axios 配置
  const axiosConfig = {
    method,
    url,
    headers,
    timeout: options.timeout || config.requestTimeout,
    responseType: options.responseType || 'json',
    maxRedirects: 5,
    validateStatus: () => true, // 不抛出 HTTP 错误状态
  }

  // 请求体
  if (method === 'GET') {
    axiosConfig.params = data
  } else {
    axiosConfig.data = data
  }

  // 代理设置
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
      logger.warn(`代理 URL 解析失败: ${proxy}`, e.message)
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
