/**
 * Request option builder
 * Used to construct axios request config
 */
'use strict'

/**
 * Create request options
 * @param {object} query request params (includes cookie, ua, proxy, etc.)
 * @param {object} [extras] extra options
 * @param {string} [extras.crypto] crypto type identifier
 * @param {object} [extras.headers] custom headers
 * @returns {object}
 */
function createOption(query = {}, extras = {}) {
  return {
    // HTTP method
    method: query.method || extras.method || 'POST',

    // headers
    headers: {
      ...(extras.headers || {}),
      ...(query.headers || {}),
    },

    // cookie
    cookie: query.cookie || {},

    // User-Agent
    ua: query.ua || extras.ua || '',

    // proxy
    proxy: query.proxy || extras.proxy || '',

    // real IP
    realIP: query.realIP || '',

    // crypto type (defined by target platform implementation)
    crypto: extras.crypto || query.crypto || '',

    // request timeout
    timeout: query.timeout || extras.timeout || 30000,

    // response type
    responseType: extras.responseType || 'json',
  }
}

module.exports = createOption
