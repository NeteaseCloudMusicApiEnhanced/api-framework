/**
 * Plugin example - demonstrates lifecycle hooks
 *
 * Available hooks (in execution order):
 *   1. beforeServer   - before server starts, can modify app and config
 *   2. afterRoutes    - after all routes are registered
 *   3. beforeRequest  - before each request is processed
 *   4. afterRequest   - after each request is processed (with result)
 *   5. onError        - when a request handler throws an error
 */

module.exports = {
  // plugin name
  name: '_example',

  /**
   * Before server starts
   * Can be used to add global middleware, modify config, etc.
   */
  beforeServer: async ({ app, config }) => {
    // example: add a global middleware to track request timing
    app.use((req, res, next) => {
      req._startTime = Date.now()
      next()
    })

    console.log('[plugin example] beforeServer hook executed')
  },

  /**
   * After all routes are registered
   */
  afterRoutes: async ({ app, config }) => {
    console.log('[plugin example] afterRoutes hook executed')
  },

  /**
   * Before each request
   */
  beforeRequest: async ({ req, res, module }) => {
    console.log(`[plugin example] beforeRequest: ${req.method} ${req.path}`)
  },

  /**
   * After each request
   */
  afterRequest: async ({ req, res, module, result }) => {
    const duration = Date.now() - (req._startTime || Date.now())
    console.log(`[plugin example] afterRequest: ${req.path} -> ${result?.status || '?'} (${duration}ms)`)
  },

  /**
   * On request error
   */
  onError: async ({ req, res, module, error }) => {
    console.error(`[plugin example] onError: ${req.path} -> ${error.message}`)
  },
}
