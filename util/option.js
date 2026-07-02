/**
 * 请求选项构建器
 * 用于统一构造 axios 请求配置
 */
'use strict'

/**
 * 创建请求选项
 * @param {object} query 请求参数（包含 cookie, ua, proxy 等）
 * @param {object} [extras] 额外选项
 * @param {string} [extras.crypto] 加密方式标识
 * @param {object} [extras.headers] 自定义请求头
 * @returns {object}
 */
function createOption(query = {}, extras = {}) {
  return {
    // HTTP 方法
    method: query.method || extras.method || 'POST',

    // 请求头
    headers: {
      ...(extras.headers || {}),
      ...(query.headers || {}),
    },

    // Cookie
    cookie: query.cookie || {},

    // User-Agent
    ua: query.ua || extras.ua || '',

    // 代理
    proxy: query.proxy || extras.proxy || '',

    // 真实 IP
    realIP: query.realIP || '',

    // 加密方式（由具体平台实现定义）
    crypto: extras.crypto || query.crypto || '',

    // 请求超时
    timeout: query.timeout || extras.timeout || 30000,

    // 响应类型
    responseType: extras.responseType || 'json',
  }
}

module.exports = createOption
