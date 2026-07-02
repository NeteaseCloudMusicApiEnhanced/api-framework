/**
 * api-framework 配置文件
 * 支持环境变量覆盖默认值
 */
'use strict'

const path = require('path')
require('dotenv').config()

const config = {
  // 服务端口
  port: parseInt(process.env.PORT, 10) || 3000,

  // 服务主机
  host: process.env.HOST || '0.0.0.0',

  // 静态文件目录
  publicDir: process.env.PUBLIC_DIR || path.join(__dirname, 'public'),

  // 模块目录
  moduleDir: process.env.MODULE_DIR || path.join(__dirname, 'module'),

  // 插件目录
  pluginsDir: process.env.PLUGINS_DIR || path.join(__dirname, 'plugins'),

  // 上传大小限制 (MB)
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 100,

  // 请求超时 (ms)
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,

  // 代理设置
  proxy: process.env.PROXY || '',

  // CORS 允许的域名（逗号分隔）
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || '*',

  // 是否启用缓存
  enableCache: process.env.ENABLE_CACHE !== 'false',

  // 缓存时间 (秒)
  cacheTTL: parseInt(process.env.CACHE_TTL, 10) || 120,

  // 是否启用日志
  enableLog: process.env.ENABLE_LOG !== 'false',

  // 日志级别: debug, info, warn, error
  logLevel: process.env.LOG_LEVEL || 'info',

  // 自定义加密配置（由用户根据目标平台填写）
  encrypt: {
    key: process.env.ENCRYPT_KEY || '',
    iv: process.env.ENCRYPT_IV || '',
  },
}

module.exports = config
