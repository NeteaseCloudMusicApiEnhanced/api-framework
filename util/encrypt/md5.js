/**
 * MD5 hash example
 *
 * Note: This is a reference implementation only. Actual platform-specific
 * encryption logic should be implemented based on the target platform's requirements.
 */
'use strict'

const crypto = require('crypto')

/**
 * Calculate MD5 hash
 * @param {string|Buffer} data input data
 * @param {string} [encoding=hex] output encoding (hex, base64, latin1)
 * @returns {string} MD5 hash value
 */
function md5(data, encoding = 'hex') {
  return crypto.createHash('md5').update(data).digest(encoding)
}

/**
 * Calculate MD5 hash of a file buffer
 * @param {Buffer} fileBuffer file buffer
 * @returns {string} hex MD5 hash value
 */
function md5File(fileBuffer) {
  return crypto.createHash('md5').update(fileBuffer).digest('hex')
}

/**
 * Repeated MD5 hash
 * @param {string} data input data
 * @param {number} [times=1] repetition count
 * @returns {string} hex MD5 hash value
 */
function md5Repeat(data, times = 1) {
  let hash = data
  for (let i = 0; i < times; i++) {
    hash = crypto.createHash('md5').update(hash).digest('hex')
  }
  return hash
}

module.exports = {
  md5,
  md5File,
  md5Repeat,
}
