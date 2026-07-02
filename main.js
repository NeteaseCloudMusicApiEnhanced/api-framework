/**
 * api-framework NPM 模块入口
 * 以编程方式使用:
 *   const api = require('api-framework')
 *   const result = await api.album({ id: '123' })
 *   const server = await api.server.serveNcmApi()
 */
'use strict'

const fs = require('fs')
const path = require('path')
const config = require('./config')

// ---- 自动加载模块 ----

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
        console.error(`[main] 加载模块失败: ${file}`, err.message)
      }
    })
}

// ---- 导出 ----

let serverModule = null

module.exports = {
  /** 服务器模块（懒加载） */
  get server() {
    if (!serverModule) {
      serverModule = require('./server')
    }
    return serverModule
  },

  /** 配置文件 */
  config,

  /** 所有模块方法 */
  ...modules,
}
