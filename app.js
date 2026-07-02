#!/usr/bin/env node
/**
 * api-framework application entry
 * Direct execution: node app.js
 * Also supports being used as a module
 */
'use strict'

const server = require('./server')
const config = require('./config')
const logger = require('./util/logger')

async function start() {
  try {
    logger.info('Starting api-framework...')

    const app = await server.createApp()
    const instance = await server.startServer(app, config.port, config.host)

    logger.success(`Server started @ http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`)

    return instance
  } catch (err) {
    logger.error('Failed to start:', err.message)
    process.exit(1)
  }
}

// start when run directly
if (require.main === module) {
  start()
}

module.exports = { start }
