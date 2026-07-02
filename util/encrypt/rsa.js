/**
 * RSA encrypt/decrypt example
 *
 * Note: This is a reference implementation only. Actual platform-specific
 * encryption logic should be implemented based on the target platform's requirements.
 */
'use strict'

const crypto = require('crypto')

/**
 * RSA encrypt with public key
 * @param {string} data plaintext
 * @param {string} publicKey PEM formatted public key
 * @param {string} [padding] padding scheme
 * @returns {string} base64 encoded ciphertext
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
 * RSA decrypt with private key
 * @param {string} data base64 encoded ciphertext
 * @param {string} privateKey PEM formatted private key
 * @param {string} [padding] padding scheme
 * @returns {string} plaintext
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
 * Generate RSA key pair
 * @param {number} [bits=2048] key length
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
