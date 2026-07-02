/**
 * {name} module
 *
 * Auto-registered route: /{name}
 * Function style: module.exports = async (ctx, core) => { ... }
 */
'use strict'

module.exports = async (ctx, core) => {
  const { query, body, cookies, files, headers } = ctx
  const { request, logger, config, cache } = core

  logger.info('[{name}] called:', JSON.stringify(query))

  // ---- write your business logic here ----

  // example: call target API
  // const result = await request('/target/api/endpoint', {
  //   param1: query.param1,
  // }, {
  //   method: 'POST',
  //   cookie: cookies,
  // })

  // return result
  return {
    status: 200,
    body: {
      code: 200,
      message: 'success',
      data: query,
    },
    // cookie: result.cookie,
  }
}
