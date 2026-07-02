/**
 * api-framework 核心服务器
 * Express + 模块自动扫描 + 插件生命周期
 */
'use strict'

const fs = require('fs')
const path = require('path')
const express = require('express')
const fileUpload = require('express-fileupload')
const config = require('./config')
const logger = require('./util/logger')
const { cookieToJson } = require('./util/helpers')
const { cacheMiddleware } = require('./util/cache')

// ---- 插件系统 ----

/**
 * 加载插件
 * @param {string} pluginsDir
 * @returns {object[]}
 */
function loadPlugins(pluginsDir) {
  const plugins = []
  if (!fs.existsSync(pluginsDir)) return plugins

  const files = fs.readdirSync(pluginsDir)
  files
    .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .forEach((file) => {
      try {
        const pluginPath = path.join(pluginsDir, file)
        const plugin = require(pluginPath)
        const name = file.replace(/\.js$/, '')
        plugins.push({ name, ...plugin })
        logger.debug(`加载插件: ${name}`)
      } catch (err) {
        logger.error(`加载插件失败: ${file}`, err.message)
      }
    })

  return plugins
}

/**
 * 执行插件生命周期钩子
 */
async function runPluginHook(plugins, hook, context = {}) {
  for (const plugin of plugins) {
    if (typeof plugin[hook] === 'function') {
      try {
        await plugin[hook](context)
      } catch (err) {
        logger.error(`插件 ${plugin.name} 的 ${hook} 钩子执行失败:`, err.message)
      }
    }
  }
}

// ---- 模块扫描 ----

/**
 * 扫描并加载模块
 * @param {string} modulesPath
 * @param {object} [routeOverrides]
 * @returns {Array<{identifier: string, route: string, module: any}>}
 */
function scanModules(modulesPath, routeOverrides = {}) {
  const modules = []
  if (!fs.existsSync(modulesPath)) {
    logger.warn(`模块目录不存在: ${modulesPath}`)
    return modules
  }

  const files = fs.readdirSync(modulesPath)
  files
    .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .forEach((file) => {
      try {
        const filePath = path.join(modulesPath, file)
        const identifier = file.replace(/\.js$/, '')
        const mod = require(filePath)

        // 判断导出格式
        let route, handler, method

        if (typeof mod === 'function') {
          // 函数式: module.exports = async (ctx, core) => {}
          route = routeOverrides[file] || `/${identifier.replace(/_/g, '/')}`
          handler = mod
          method = 'all'
        } else if (mod && typeof mod === 'object') {
          // 对象式: module.exports = { route, method, handler }
          route = mod.route || routeOverrides[file] || `/${identifier.replace(/_/g, '/')}`
          handler = mod.handler
          method = (mod.method || 'all').toLowerCase()
        } else {
          logger.warn(`跳过无效模块: ${file}`)
          return
        }

        if (typeof handler !== 'function') {
          logger.warn(`模块 ${file} 缺少有效的 handler`)
          return
        }

        modules.push({
          identifier,
          route,
          module: mod,
          handler,
          method,
        })

        logger.debug(`扫描模块: ${identifier} -> ${method.toUpperCase()} ${route}`)
      } catch (err) {
        logger.error(`加载模块失败: ${file}`, err.message)
      }
    })

  return modules
}

// ---- 核心应用工厂 ----

/**
 * 创建 Express 应用
 * @param {object} [options]
 * @param {Array} [options.moduleDefs] 自定义模块定义（覆盖自动扫描）
 * @param {Array} [options.plugins] 自定义插件列表
 * @returns {Promise<import('express').Express>}
 */
async function createApp(options = {}) {
  const app = express()

  // 加载插件
  const plugins = options.plugins || loadPlugins(config.pluginsDir)

  // ---- beforeServer 钩子 ----
  await runPluginHook(plugins, 'beforeServer', { app, config })

  // ---- 中间件 ----

  // 静态文件
  app.use(express.static(config.publicDir))

  // CORS
  app.use((req, res, next) => {
    const allowOrigin = config.corsAllowOrigin === '*'
      ? '*'
      : (req.headers.origin && config.corsAllowOrigin.split(',').map(s => s.trim()).includes(req.headers.origin)
          ? req.headers.origin
          : '*')

    res.set({
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    })

    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
    next()
  })

  // Cookie 解析
  app.use((req, _, next) => {
    req.cookies = cookieToJson(req.headers.cookie || '')
    next()
  })

  // Body 解析
  const uploadLimit = `${config.maxUploadSize}mb`
  app.use(express.json({ limit: uploadLimit }))
  app.use(express.urlencoded({ extended: false, limit: uploadLimit }))
  app.use(
    fileUpload({
      limits: { fileSize: config.maxUploadSize * 1024 * 1024 },
      useTempFiles: true,
      tempFileDir: path.join(require('os').tmpdir(), 'api-framework-uploads'),
      abortOnLimit: true,
      parseNested: true,
    }),
  )

  // 缓存中间件
  if (config.enableCache) {
    app.use(cacheMiddleware(config.cacheTTL))
  }

  // ---- 扫描并注册模块路由 ----
  const moduleDefs = options.moduleDefs || scanModules(config.moduleDir)

  for (const modDef of moduleDefs) {
    const { route, handler, method } = modDef

    app[method](route, async (req, res) => {
      // ---- beforeRequest 钩子 ----
      const hookContext = { req, res, module: modDef }
      await runPluginHook(plugins, 'beforeRequest', hookContext)

      // 构建 ctx
      const ctx = {
        query: { ...req.query, ...req.body, ...req.files },
        body: req.body || {},
        cookies: req.cookies,
        files: req.files || {},
        headers: req.headers,
        method: req.method,
        path: req.path,
        ip: req.ip,
      }

      // 构建 core
      const request = require('./util/request')
      const cache = require('./util/cache')
      const core = {
        request,
        logger,
        config,
        cache: new cache.MemoryCache(config.cacheTTL),
        req,
        res,
      }

      try {
        let result

        if (typeof modDef.module === 'function') {
          // 函数式: handler(ctx, core)
          result = await handler(ctx, core)
        } else if (modDef.module && typeof modDef.module === 'object') {
          // 对象式: handler 就是 modDef.handler
          result = await handler(ctx, core)
        }

        // ---- afterRequest 钩子 ----
        await runPluginHook(plugins, 'afterRequest', { ...hookContext, result })

        // 处理返回值
        if (!result) {
          res.status(404).json({ code: 404, msg: 'Not Found' })
          return
        }

        // 支持重定向
        if (result.redirectUrl) {
          res.redirect(result.status || 302, result.redirectUrl)
          return
        }

        // 设置 Cookie
        if (result.cookie && !ctx.query.noCookie) {
          const cookies = Array.isArray(result.cookie) ? result.cookie : [result.cookie]
          cookies.forEach((c) => {
            if (c) res.append('Set-Cookie', c)
          })
        }

        // 返回响应
        const statusCode = result.status || 200
        res.status(statusCode).json(result.body !== undefined ? result.body : result)
      } catch (err) {
        logger.error(`[${modDef.identifier}] 处理失败:`, err.message)

        // ---- onError 钩子 ----
        await runPluginHook(plugins, 'onError', { ...hookContext, error: err })

        res.status(500).json({
          code: 500,
          msg: err.message || 'Internal Server Error',
        })
      }
    })

    logger.info(`注册路由: ${method.toUpperCase()} ${route}`)
  }

  // ---- afterRoutes 钩子 ----
  await runPluginHook(plugins, 'afterRoutes', { app, config })

  return app
}

/**
 * 启动 HTTP 服务
 * @param {import('express').Express} app
 * @param {number} port
 * @param {string} host
 * @returns {Promise<import('http').Server>}
 */
function startServer(app, port, host) {
  return new Promise((resolve) => {
    const server = app.listen(port, host, () => {
      resolve(server)
    })
  })
}

module.exports = {
  createApp,
  startServer,
  scanModules,
  loadPlugins,
}
