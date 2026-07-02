/**
 * AES encrypt/decrypt example
 *
 * Note: This is a reference implementation only. Actual platform-specific
 * encryption logic should be implemented based on the target platform's requirements.
 * Copy this file to create a new encryption module (e.g. platform-crypto.js)
 * and modify according to the target platform.
 */
'use strict'

const crypto = require('crypto')

const ALGORITHM_AES_128_CBC = 'aes-128-cbc'
const ALGORITHM_AES_256_CBC = 'aes-256-cbc'
const ALGORITHM_AES_128_ECB = 'aes-128-ecb'
const ALGORITHM_AES_256_ECB = 'aes-256-ecb'

/**
 * AES encrypt
 * @param {string|Buffer} data plaintext
 * @param {string} key secret key
 * @param {string} [iv] initialization vector
 * @param {string} [algorithm=aes-128-cbc] algorithm
 * @param {string} [encoding=hex] output encoding
 * @returns {string} ciphertext
 */
function aesEncrypt(data, key, iv = '', algorithm = ALGORITHM_AES_128_CBC, encoding = 'hex') {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(key),
    iv ? Buffer.from(iv) : Buffer.alloc(0),
  )
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(data)),
    cipher.final(),
  ])
  return encrypted.toString(encoding)
}

/**
 * AES decrypt
 * @param {string|Buffer} data ciphertext
 * @param {string} key secret key
 * @param {string} [iv] initialization vector
 * @param {string} [algorithm=aes-128-cbc] algorithm
 * @param {string} [encoding=hex] input encoding
 * @returns {string} plaintext
 */
function aesDecrypt(data, key, iv = '', algorithm = ALGORITHM_AES_128_CBC, encoding = 'hex') {
  const input = typeof data === 'string' ? Buffer.from(data, encoding) : data
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key),
    iv ? Buffer.from(iv) : Buffer.alloc(0),
  )
  const decrypted = Buffer.concat([
    decipher.update(input),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

module.exports = {
  aesEncrypt,
  aesDecrypt,
  ALGORITHM_AES_128_CBC,
  ALGORITHM_AES_256_CBC,
  ALGORITHM_AES_128_ECB,
  ALGORITHM_AES_256_ECB,
}
