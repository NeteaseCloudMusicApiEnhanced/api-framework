/**
 * {name} 模块
 * 
 * 自动注册路由: /{name}
 * 函数式导出：module.exports = async (ctx, core) => { ... }
 */
'use strict'

module.exports = async (ctx, core) => {
  const { query, body, cookies, files, headers } = ctx
  const { request, logger, config, cache } = core

  logger.info('[{name}] 被调用:', JSON.stringify(query))

  // ---- 在这里编写你的业务逻辑 ----

  // 示例：调用目标 API
  // const result = await request('/target/api/endpoint', {
  //   param1: query.param1,
  // }, {
  //   method: 'POST',
  //   cookie: cookies,
  // })

  // 返回结果
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
