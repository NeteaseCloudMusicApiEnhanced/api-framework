/**
 * RSA 加密/解密 示例
 * 
 * 注意：这只是一个参考实现，具体平台的加密逻辑
 * 需要根据目标平台的实际情况进行适配。
 */
'use strict'

const crypto = require('crypto')

/**
 * 使用公钥加密
 * @param {string} data 明文
 * @param {string} publicKey PEM 格式公钥
 * @param {string} [padding] 填充方式
 * @returns {string} Base64 编码密文
 */
function rsaEncrypt(data, publicKey, padding = 'RSA_PKCS1_PADDING') {
  const buffer = Buffer.from(data)
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants[padding] || crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer,
  )
  return encrypted.toString('base64')
}

/**
 * 使用私钥解密
 * @param {string} data Base64 编码密文
 * @param {string} privateKey PEM 格式私钥
 * @param {string} [padding] 填充方式
 * @returns {string} 明文
 */
function rsaDecrypt(data, privateKey, padding = 'RSA_PKCS1_PADDING') {
  const buffer = Buffer.from(data, 'base64')
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants[padding] || crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer,
  )
  return decrypted.toString('utf8')
}

/**
 * 生成 RSA 密钥对
 * @param {number} [bits=2048] 密钥长度
 * @returns {{ publicKey: string, privateKey: string }}
 */
function generateKeyPair(bits = 2048) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: bits,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })
  return { publicKey, privateKey }
}

module.exports = {
  rsaEncrypt,
  rsaDecrypt,
  generateKeyPair,
}
