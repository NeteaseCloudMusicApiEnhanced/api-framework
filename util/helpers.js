/**
 * 通用辅助函数
 */
'use strict'

/**
 * 将 cookie 字符串解析为对象
 * @param {string} cookieStr
 * @returns {object}
 */
function cookieToJson(cookieStr) {
  if (!cookieStr) return {}
  const obj = {}
  cookieStr.split(/;\s*/).forEach((pair) => {
    const idx = pair.indexOf('=')
    if (idx > 0 && idx < pair.length - 1) {
      obj[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim()
    }
  })
  return obj
}

/**
 * 将 cookie 对象转换为字符串
 * @param {object} cookieObj
 * @returns {string}
 */
function cookieObjToString(cookieObj) {
  if (!cookieObj || typeof cookieObj !== 'object') return ''
  return Object.entries(cookieObj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('; ')
}

/**
 * 将字符串转为 boolean
 * @param {any} val
 * @returns {boolean}
 */
function toBoolean(val) {
  if (typeof val === 'boolean') return val
  if (val === '') return false
  return val === 'true' || val === '1'
}

/**
 * 延迟函数
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 深拷贝对象
 * @param {object} obj
 * @returns {object}
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 生成随机字符串
 * @param {number} len
 * @returns {string}
 */
function randomString(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 合并多个对象（忽略 undefined 值）
 * @param {...object} objects
 * @returns {object}
 */
function mergeObjects(...objects) {
  const result = {}
  objects.forEach((obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (obj[key] !== undefined) {
          result[key] = obj[key]
        }
      })
    }
  })
  return result
}

module.exports = {
  cookieToJson,
  cookieObjToString,
  toBoolean,
  sleep,
  deepClone,
  randomString,
  mergeObjects,
}
