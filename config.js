/**
 * api-framework configuration
 * Supports environment variable overrides
 */
'use strict'

const path = require('path')
require('dotenv').config()

const cwd = process.cwd()

const config = {
  // server port
  port: parseInt(process.env.PORT, 10) || 3000,

  // server host
  host: process.env.HOST || '0.0.0.0',

  // static files directory
  publicDir: process.env.PUBLIC_DIR || path.join(cwd, 'public'),

  // modules directory
  moduleDir: process.env.MODULE_DIR || path.join(cwd, 'module'),

  // plugins directory
  pluginsDir: process.env.PLUGINS_DIR || path.join(cwd, 'plugins'),

  // max upload size (MB)
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || 100,

  // request timeout (ms)
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,

  // proxy setting
  proxy: process.env.PROXY || '',

  // CORS allowed origins (comma separated)
  corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN || '*',

  // enable cache
  enableCache: process.env.ENABLE_CACHE !== 'false',

  // cache TTL (seconds)
  cacheTTL: parseInt(process.env.CACHE_TTL, 10) || 120,

  // enable logging
  enableLog: process.env.ENABLE_LOG !== 'false',

  // log level: debug, info, warn, error
  logLevel: process.env.LOG_LEVEL || 'info',

  // custom encryption config (fill in based on target platform)
  encrypt: {
    key: process.env.ENCRYPT_KEY || '',
    iv: process.env.ENCRYPT_IV || '',
  },
}

module.exports = config
