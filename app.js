#!/usr/bin/env node
/**
 * api-framework 应用入口
 * 可直接执行: node app.js
 * 也支持作为模块被引用
 */
'use strict'

const server = require('./server')
const config = require('./config')
const logger = require('./util/logger')

async function start() {
  try {
    logger.info('api-framework 启动中...')

    const app = await server.createApp()
    const instance = await server.startServer(app, config.port, config.host)

    logger.success(`服务已启动 @ http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`)

    return instance
  } catch (err) {
    logger.error('启动失败:', err.message)
    process.exit(1)
  }
}

// 直接运行时启动
if (require.main === module) {
  start()
}

module.exports = { start }
