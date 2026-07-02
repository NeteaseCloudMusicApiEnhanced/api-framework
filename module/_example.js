/**
 * Module example - shows two export styles
 *
 * Style 1: Function style (recommended)
 *   module.exports = async (ctx, core) => { ... }
 *   Route auto-generated from filename: /_example
 *
 * Style 2: Object style (for custom route/method)
 *   module.exports = { route, method, handler }
 */

// ==========================================
// Style 1: Function style (default export)
// ==========================================

// Uncomment to enable:
// module.exports = async (ctx, core) => {
//   const { query, body, cookies, files, headers } = ctx
//   const { request, logger, config, cache } = core
//
//   logger.info('Request received:', query)
//
//   // use request to call target API
//   const result = await request('/api/example', {
//     id: query.id,
//   }, {
//     method: 'POST',
//     cookie: cookies,
//   })
//
//   return {
//     status: result.status,
//     body: result.body,
//     cookie: result.cookie,
//   }
// }

// ==========================================
// Style 2: Object style (custom route/method)
// ==========================================

module.exports = {
  // custom route (optional, defaults to filename-based)
  route: '/example',

  // HTTP method (optional, defaults to 'all')
  method: 'all',

  // request handler
  handler: async (ctx, core) => {
    const { query, body, cookies } = ctx
    const { request, logger, config, cache } = core

    logger.info('Example module invoked')

    // check cache
    const cached = cache.get('example_data')
    if (cached) {
      logger.info('Returning cached data')
      return {
        status: 200,
        body: { code: 200, data: cached, fromCache: true },
      }
    }

    // use request to call external API
    const response = await request('/api/external-endpoint', {
      param1: query.param1 || body.param1 || 'default',
    }, {
      method: 'POST',
      cookie: cookies,
      headers: {
        'X-Custom-Header': 'value',
      },
    })

    // cache result
    cache.set('example_data', response.body, 60)

    return {
      status: response.status,
      body: response.body,
      cookie: response.cookie,
    }
  },
}
