/**
 * MD5 哈希 示例
 * 
 * 注意：这只是一个参考实现，具体平台的加密逻辑
 * 需要根据目标平台的实际情况进行适配。
 */
'use strict'

const crypto = require('crypto')

/**
 * 计算 MD5 哈希
 * @param {string|Buffer} data 输入数据
 * @param {string} [encoding=hex] 输出编码 (hex, base64, latin1)
 * @returns {string} MD5 哈希值
 */
function md5(data, encoding = 'hex') {
  return crypto.createHash('md5').update(data).digest(encoding)
}

/**
 * 计算文件的 MD5 哈希
 * @param {Buffer} fileBuffer 文件缓冲区
 * @returns {string} 十六进制 MD5 哈希值
 */
function md5File(fileBuffer) {
  return crypto.createHash('md5').update(fileBuffer).digest('hex')
}

/**
 * 多次 MD5 哈希
 * @param {string} data 输入数据
 * @param {number} [times=1] 重复次数
 * @returns {string} 十六进制 MD5 哈希值
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
