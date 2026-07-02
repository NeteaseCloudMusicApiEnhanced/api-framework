/**
 * api-framework npm module entry
 * Programmatic usage:
 *   const api = require('@neteasecloudmusicapienhanced/api-framework')
 *   const result = await api.album({ id: '123' })
 *   const server = await api.server.createApp()
 */
'use strict'

const fs = require('fs')
const path = require('path')
const config = require('./config')

// ---- auto load modules ----

/** @type {Record<string, Function>} */
const modules = {}

const moduleDir = config.moduleDir
if (fs.existsSync(moduleDir)) {
  const files = fs.readdirSync(moduleDir)
  files
    .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .forEach((file) => {
      const filePath = path.join(moduleDir, file)
      const identifier = file.replace(/\.js$/, '')
      try {
        const mod = require(filePath)
        const request = require('./util/request')

        modules[identifier] = async (params = {}) => {
          const ctx = {
            query: { ...params },
            body: params,
            cookies: params.cookie || {},
            files: {},
            headers: {},
          }
          const core = {
            request,
            logger: require('./util/logger'),
            config,
            cache: new (require('./util/cache').MemoryCache)(config.cacheTTL),
          }

          if (typeof mod === 'function') {
            return mod(ctx, core)
          } else if (mod && typeof mod === 'object' && typeof mod.handler === 'function') {
            return mod.handler(ctx, core)
          }
          return null
        }
      } catch (err) {
        console.error(`[main] Failed to load module: ${file}`, err.message)
      }
    })
}

// ---- exports ----

let serverModule = null

module.exports = {
  /** server module (lazy loaded) */
  get server() {
    if (!serverModule) {
      serverModule = require('./server')
    }
    return serverModule
  },

  /** config object */
  config,

  /** all module methods */
  ...modules,
}
