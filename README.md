# api-framework

通用 API 反向代理框架 —— 为逆向工程师打造的 API 反代脚手架。

## 特性

- 🚀 **开箱即用** - 基于 Express，快速搭建 API 反向代理服务
- 📦 **自动路由** - 模块文件自动扫描，文件名即路由路径
- 🔌 **插件系统** - 完整的生命周期钩子（beforeServer、afterRoutes、beforeRequest、afterRequest、onError）
- 🎯 **双模块风格** - 支持函数式 `module.exports = async (ctx, core) => {}` 和对象式 `module.exports = { route, method, handler }`
- 🔧 **CLI 工具** - `init`、`dev`、`start`、`generate` 等命令
- 🔒 **加密示例** - 提供 AES、RSA、MD5 参考实现（不捆绑特定平台加密）
- 📦 **NPM 库模式** - 支持作为 Node.js 库引入使用
- 🪶 **轻量** - 无数据库依赖，纯内存缓存

## 快速开始

```bash
# 创建新项目
npx api-framework init my-api-project

# 进入项目目录
cd my-api-project

# 启动开发模式
npm run dev
```

## 安装

全局安装：

```bash
npm install -g api-framework
```

或在项目中安装：

```bash
npm install api-framework
```

## CLI 命令

```bash
# 创建新项目
api-framework init <project-name>

# 开发模式（带热重载）
api-framework dev

# 生产模式启动
api-framework start

# 生成新模块
api-framework generate module <name>

# 生成新插件
api-framework generate plugin <name>
```

## 模块编写

### 风格一：函数式（推荐）

文件名 `module/user_info.js` 自动映射到路由 `/user/info`：

```javascript
// module/user_info.js
module.exports = async (ctx, core) => {
  const { query, body, cookies, files, headers } = ctx
  const { request, logger, config, cache } = core

  // 调用目标 API
  const result = await request('/target/api', {
    id: query.id,
  }, {
    method: 'POST',
    cookie: cookies,
  })

  return {
    status: result.status,
    body: result.body,
    cookie: result.cookie,
  }
}
```

### 风格二：对象式

```javascript
// module/custom-route.js
module.exports = {
  route: '/api/v1/custom',
  method: 'get',
  handler: async (ctx, core) => {
    return {
      status: 200,
      body: { code: 200, data: 'hello' },
    }
  },
}
```

## ctx 和 core

### ctx（请求上下文）

| 属性    | 类型   | 说明                           |
| ------- | ------ | ------------------------------ |
| query   | object | 合并的请求参数（query + body + files） |
| body    | object | 请求体                           |
| cookies | object | 解析后的 Cookie 对象              |
| files   | object | 上传的文件                       |
| headers | object | 请求头                           |
| method  | string | HTTP 方法                       |
| path    | string | 请求路径                         |
| ip      | string | 客户端 IP                       |

### core（核心工具）

| 属性    | 类型     | 说明           |
| ------- | -------- | -------------- |
| request | function | HTTP 请求引擎（axios 封装） |
| logger  | object   | 日志工具       |
| config  | object   | 当前配置       |
| cache   | object   | 内存缓存实例   |
| req     | object   | Express req 对象 |
| res     | object   | Express res 对象 |

## 插件编写

插件支持 5 个生命周期钩子：

```javascript
// plugins/my-plugin.js
module.exports = {
  name: 'my-plugin',

  // 服务器启动前
  beforeServer: async ({ app, config }) => {},

  // 路由注册完成后
  afterRoutes: async ({ app, config }) => {},

  // 每次请求处理前
  beforeRequest: async ({ req, res, module }) => {},

  // 每次请求处理后
  afterRequest: async ({ req, res, module, result }) => {},

  // 请求出错时
  onError: async ({ req, res, module, error }) => {},
}
```

## 配置

支持环境变量和 `config.js` 两种方式：

```bash
# .env
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
ENABLE_CACHE=true
CACHE_TTL=120
CORS_ALLOW_ORIGIN=*
MAX_UPLOAD_SIZE=100
REQUEST_TIMEOUT=30000
```

```javascript
// config.js（覆盖默认配置）
module.exports = {
  port: 3000,
  host: '0.0.0.0',
  // ...
}
```

## 作为 NPM 库使用

```javascript
const api = require('api-framework')

// 启动服务器
const server = await api.server.createApp()
await api.server.startServer(server, 3000, '0.0.0.0')

// 或者直接调用模块
const result = await api.user_info({ id: '123' })
```

## 项目结构

```
my-api-project/
├── config.js          # 配置文件
├── .env               # 环境变量
├── app.js             # 应用入口（自动生成）
├── main.js            # 模块入口（自动生成）
├── module/            # API 模块目录
│   ├── example.js     # 示例模块
│   └── ...
├── plugins/           # 插件目录
│   └── ...
├── util/              # 工具函数
│   ├── index.js       # 你的工具函数
│   └── encrypt/       # 加密示例
│       ├── aes.js
│       ├── rsa.js
│       └── md5.js
└── public/            # 静态文件
```

## 与 api-enhanced 的关系

api-framework 是 [api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) 项目架构的通用化提取。如果你熟悉 api-enhanced，你将能快速上手 api-framework。

主要区别：
- api-enhanced 专注于网易云音乐 API
- api-framework 是通用的 API 反向代理框架，适用于任何平台
- api-framework 不捆绑任何特定平台的加密逻辑

## License

MIT
