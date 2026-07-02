/**
 * 插件示例 - 展示生命周期钩子
 * 
 * 可用钩子（按执行顺序）：
 *   1. beforeServer   - 服务器启动前，可以修改 app 和 config
 *   2. afterRoutes    - 所有路由注册完成后
 *   3. beforeRequest  - 每次请求处理前
 *   4. afterRequest   - 每次请求处理后（拿到结果后）
 *   5. onError        - 请求处理出错时
 */

module.exports = {
  // 插件名称
  name: '_example',

  /**
   * 服务器启动前钩子
   * 可用于添加全局中间件、修改配置等
   */
  beforeServer: async ({ app, config }) => {
    // 示例：添加一个全局中间件
    app.use((req, res, next) => {
      // 可以在这里记录所有请求的耗时
      req._startTime = Date.now()
      next()
    })

    console.log('[插件示例] beforeServer 钩子执行完毕')
  },

  /**
   * 所有路由注册完成后钩子
   */
  afterRoutes: async ({ app, config }) => {
    console.log('[插件示例] afterRoutes 钩子执行完毕')
  },

  /**
   * 每次请求处理前钩子
   */
  beforeRequest: async ({ req, res, module }) => {
    console.log(`[插件示例] beforeRequest: ${req.method} ${req.path}`)
  },

  /**
   * 每次请求处理后钩子
   */
  afterRequest: async ({ req, res, module, result }) => {
    const duration = Date.now() - (req._startTime || Date.now())
    console.log(`[插件示例] afterRequest: ${req.path} -> ${result?.status || '?'} (${duration}ms)`)
  },

  /**
   * 请求处理出错时钩子
   */
  onError: async ({ req, res, module, error }) => {
    console.error(`[插件示例] onError: ${req.path} -> ${error.message}`)
  },
}
