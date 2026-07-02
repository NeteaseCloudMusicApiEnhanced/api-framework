/**
 * 模块示例 - 展示两种导出风格
 * 
 * 风格一：函数式（推荐）
 *   module.exports = async (ctx, core) => { ... }
 *   路由自动根据文件名生成：/_example
 * 
 * 风格二：对象式（需要自定义路由/方法时用）
 *   module.exports = { route, method, handler }
 */

// ==========================================
// 风格一：函数式（默认导出）
// ==========================================

// 取消注释即可启用：
// module.exports = async (ctx, core) => {
//   const { query, body, cookies, files, headers } = ctx
//   const { request, logger, config, cache } = core
//
//   logger.info('收到请求:', query)
//
//   // 使用 request 调用目标 API
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
// 风格二：对象式（自定义路由/方法）
// ==========================================

module.exports = {
  // 自定义路由（可选，默认根据文件名生成）
  route: '/example',

  // HTTP 方法（可选，默认 all）
  method: 'all',

  // 请求处理器
  handler: async (ctx, core) => {
    const { query, body, cookies } = ctx
    const { request, logger, config, cache } = core

    logger.info('示例模块被调用喵~')

    // 检查是否有缓存
    const cached = cache.get('example_data')
    if (cached) {
      logger.info('返回缓存数据')
      return {
        status: 200,
        body: { code: 200, data: cached, fromCache: true },
      }
    }

    // 使用 request 请求外部 API
    const response = await request('/api/external-endpoint', {
      param1: query.param1 || body.param1 || 'default',
    }, {
      method: 'POST',
      cookie: cookies,
      headers: {
        'X-Custom-Header': 'value',
      },
    })

    // 缓存结果
    cache.set('example_data', response.body, 60)

    return {
      status: response.status,
      body: response.body,
      cookie: response.cookie,
    }
  },
}
