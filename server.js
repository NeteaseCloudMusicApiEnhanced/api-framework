/**
 * api-framework core server
 * Express + module auto scanner + plugin lifecycle
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

// ---- plugin system ----

/**
 * Load plugins
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
        logger.debug(`Loaded plugin: ${name}`)
      } catch (err) {
        logger.error(`Failed to load plugin: ${file}`, err.message)
      }
    })

  return plugins
}

/**
 * Run plugin lifecycle hooks
 */
async function runPluginHook(plugins, hook, context = {}) {
  for (const plugin of plugins) {
    if (typeof plugin[hook] === 'function') {
      try {
        await plugin[hook](context)
      } catch (err) {
        logger.error(`Plugin ${plugin.name} hook ${hook} failed:`, err.message)
      }
    }
  }
}

// ---- module scanner ----

/**
 * Scan and load modules
 * @param {string} modulesPath
 * @param {object} [routeOverrides]
 * @returns {Array<{identifier: string, route: string, module: any}>}
 */
function scanModules(modulesPath, routeOverrides = {}) {
  const modules = []
  if (!fs.existsSync(modulesPath)) {
    logger.warn(`Module directory not found: ${modulesPath}`)
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

        // detect export format
        let route, handler, method

        if (typeof mod === 'function') {
          // function style: module.exports = async (ctx, core) => {}
          route = routeOverrides[file] || `/${identifier.replace(/_/g, '/')}`
          handler = mod
          method = 'all'
        } else if (mod && typeof mod === 'object') {
          // object style: module.exports = { route, method, handler }
          route = mod.route || routeOverrides[file] || `/${identifier.replace(/_/g, '/')}`
          handler = mod.handler
          method = (mod.method || 'all').toLowerCase()
        } else {
          logger.warn(`Skipped invalid module: ${file}`)
          return
        }

        if (typeof handler !== 'function') {
          logger.warn(`Module ${file} missing valid handler`)
          return
        }

        modules.push({
          identifier,
          route,
          module: mod,
          handler,
          method,
        })

        logger.debug(`Scanned module: ${identifier} -> ${method.toUpperCase()} ${route}`)
      } catch (err) {
        logger.error(`Failed to load module: ${file}`, err.message)
      }
    })

  return modules
}

// ---- core app factory ----

/**
 * Create Express application
 * @param {object} [options]
 * @param {Array} [options.moduleDefs] custom module definitions (overrides auto-scan)
 * @param {Array} [options.plugins] custom plugin list
 * @returns {Promise<import('express').Express>}
 */
async function createApp(options = {}) {
  const app = express()

  // load plugins
  const plugins = options.plugins || loadPlugins(config.pluginsDir)

  // ---- beforeServer hook ----
  await runPluginHook(plugins, 'beforeServer', { app, config })

  // ---- middleware ----

  // static files
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

  // Cookie parser
  app.use((req, _, next) => {
    req.cookies = cookieToJson(req.headers.cookie || '')
    next()
  })

  // Body parser
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

  // cache middleware
  if (config.enableCache) {
    app.use(cacheMiddleware(config.cacheTTL))
  }

  // ---- scan and register module routes ----
  const moduleDefs = options.moduleDefs || scanModules(config.moduleDir)

  for (const modDef of moduleDefs) {
    const { route, handler, method } = modDef

    app[method](route, async (req, res) => {
      // ---- beforeRequest hook ----
      const hookContext = { req, res, module: modDef }
      await runPluginHook(plugins, 'beforeRequest', hookContext)

      // build ctx
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

      // build core
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
          // function style: handler(ctx, core)
          result = await handler(ctx, core)
        } else if (modDef.module && typeof modDef.module === 'object') {
          // object style: handler is modDef.handler
          result = await handler(ctx, core)
        }

        // ---- afterRequest hook ----
        await runPluginHook(plugins, 'afterRequest', { ...hookContext, result })

        // handle response
        if (!result) {
          res.status(404).json({ code: 404, msg: 'Not Found' })
          return
        }

        // support redirect
        if (result.redirectUrl) {
          res.redirect(result.status || 302, result.redirectUrl)
          return
        }

        // set Cookie
        if (result.cookie && !ctx.query.noCookie) {
          const cookies = Array.isArray(result.cookie) ? result.cookie : [result.cookie]
          cookies.forEach((c) => {
            if (c) res.append('Set-Cookie', c)
          })
        }

        // send response
        const statusCode = result.status || 200
        res.status(statusCode).json(result.body !== undefined ? result.body : result)
      } catch (err) {
        logger.error(`[${modDef.identifier}] handler failed:`, err.message)

        // ---- onError hook ----
        await runPluginHook(plugins, 'onError', { ...hookContext, error: err })

        res.status(500).json({
          code: 500,
          msg: err.message || 'Internal Server Error',
        })
      }
    })

    // logger.info(`Registered route: ${method.toUpperCase()} ${route}`)
  }

  // ---- afterRoutes hook ----
  await runPluginHook(plugins, 'afterRoutes', { app, config })

  return app
}

/**
 * Start HTTP server
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
