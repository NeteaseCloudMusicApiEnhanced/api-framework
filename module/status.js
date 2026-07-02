/**
 * Server status endpoint
 * Access: GET /api/status
 */
'use strict'

const pkg = require('../package.json')

module.exports = {
  route: '/api/status',
  method: 'get',
  handler: async (ctx, core) => {
    return {
      status: 200,
      body: {
        code: 200,
        message: 'ok',
        data: {
          version: pkg.version,
          name: pkg.name,
          uptime: process.uptime(),
          timestamp: Date.now(),
        },
      },
    }
  },
}
