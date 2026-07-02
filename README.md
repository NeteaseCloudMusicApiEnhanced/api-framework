# api-framework

通用 API 反向代理框架，为逆向工程师打造的 API 反代脚手架，基于 [api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) 项目架构提取。


## 安装

```bash
npm install @neteasecloudmusicapienhanced/api-framework
```

全局安装：

```bash
npm install -g @neteasecloudmusicapienhanced/api-framework
```

## 快速开始

```bash
# 创建新项目
npx @neteasecloudmusicapienhanced/api-framework init my-project

# 进入目录
cd my-project

# 启动开发模式
npm run dev
```

## CLI 命令

| 命令 | 说明 |
|------|------|
| `init <name>` | 创建新项目 |
| `dev` | 开发模式（热重载） |
| `start` | 生产模式启动 |
| `generate module <name>` | 生成模块模板 |
| `generate plugin <name>` | 生成插件模板 |

## 模块编写

### 函数式（推荐）

文件名 `module/user_info.js` 自动映射到路由 `/user/info`，下划线 `_` 转为斜杠 `/`。

```javascript
module.exports = async (ctx, core) => {
  const { query, body, cookies } = ctx
  const { request, logger } = core

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

### 对象式

需要自定义路由或 HTTP 方法时使用：

```javascript
module.exports = {
  route: '/api/v1/custom',
  method: 'get',
  handler: async (ctx, core) => {
    return {
      status: 200,
      body: { code: 200, data: 'ok' },
    }
  },
}
```

## ctx 和 core

### ctx（请求上下文）

| 属性 | 类型 | 说明 |
|------|------|------|
| query | object | 合并的请求参数（query + body + files） |
| body | object | 请求体 |
| cookies | object | 解析后的 Cookie 对象 |
| files | object | 上传的文件 |
| headers | object | 请求头 |
| method | string | HTTP 方法 |
| path | string | 请求路径 |
| ip | string | 客户端 IP |

### core（核心工具）

| 属性 | 类型 | 说明 |
|------|------|------|
| request | function | HTTP 请求引擎（axios 封装） |
| logger | object | 分级日志工具 |
| config | object | 当前配置 |
| cache | object | 内存缓存实例 |
| req | object | Express req 对象 |
| res | object | Express res 对象 |

## 插件编写

插件支持 5 个生命周期钩子，按执行顺序排列：

```javascript
module.exports = {
  name: 'my-plugin',

  // 服务器启动前，可修改 app 和 config
  beforeServer: async ({ app, config }) => {},

  // 所有路由注册完成后
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

通过 `.env` 文件或环境变量配置：

```bash
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
ENABLE_CACHE=true
CACHE_TTL=120
CORS_ALLOW_ORIGIN=*
MAX_UPLOAD_SIZE=100
REQUEST_TIMEOUT=30000
```

也可通过项目根目录的 `config.js` 覆盖框架默认配置：

```javascript
module.exports = {
  port: 3000,
  host: '0.0.0.0',
}
```

## 作为 npm 库使用

```javascript
const api = require('@neteasecloudmusicapienhanced/api-framework')

// 启动服务器
const app = await api.server.createApp()
await api.server.startServer(app, 3000, '0.0.0.0')

// 直接调用模块方法
const result = await api.user_info({ id: '123' })
```

## 项目结构

```
my-project/
├── config.js        # 配置文件
├── .env             # 环境变量
├── module/          # API 模块
│   ├── example.js
│   └── ...
├── plugins/         # 插件
│   └── ...
├── util/            # 工具函数
│   ├── index.js
│   └── encrypt/     # 加密示例
│       ├── aes.js
│       ├── rsa.js
│       └── md5.js
└── public/          # 静态文件
```

## 与 api-enhanced 的关系

api-framework 是 [api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) 架构的通用化提取。区别在于：

- api-enhanced 专用于网易云音乐 API，内置平台加密
- api-framework 为通用框架，不捆绑任何平台加密，加密由用户在 util/encrypt/ 中自行实现

## License

MIT
