/**
 * AES 加密/解密 示例
 * 
 * 注意：这只是一个参考实现，具体平台的加密逻辑
 * 需要根据目标平台的实际情况进行适配。
 * 请将此文件复制为新的加密文件（如 platform-crypto.js）
 * 并根据目标平台的加密要求修改。
 */
'use strict'

const crypto = require('crypto')

const ALGORITHM_AES_128_CBC = 'aes-128-cbc'
const ALGORITHM_AES_256_CBC = 'aes-256-cbc'
const ALGORITHM_AES_128_ECB = 'aes-128-ecb'
const ALGORITHM_AES_256_ECB = 'aes-256-ecb'

/**
 * AES 加密
 * @param {string|Buffer} data 明文
 * @param {string} key 密钥
 * @param {string} [iv] 初始化向量
 * @param {string} [algorithm=aes-128-cbc] 算法
 * @param {string} [encoding=hex] 输出编码
 * @returns {string} 密文
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
 * AES 解密
 * @param {string|Buffer} data 密文
 * @param {string} key 密钥
 * @param {string} [iv] 初始化向量
 * @param {string} [algorithm=aes-128-cbc] 算法
 * @param {string} [encoding=hex] 输入编码
 * @returns {string} 明文
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
