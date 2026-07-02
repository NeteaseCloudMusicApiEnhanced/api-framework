# api-framework

A generic API reverse proxy framework for reverse engineers to build platform API proxies. Extracted from the [api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) project architecture.

## Features

- **Auto routing** - module files are auto-scanned and registered, filename becomes route path
- **Dual module style** - supports function style `module.exports = async (ctx, core) => {}` and object style `module.exports = { route, method, handler }`
- **Plugin system** - lifecycle hooks: beforeServer, afterRoutes, beforeRequest, afterRequest, onError
- **CLI tool** - commands: init, dev, start, generate
- **Encryption examples** - AES, RSA, MD5 reference implementations in util/encrypt/ (no platform-specific crypto bundled)
- **npm library mode** - can be used programmatically as a Node.js library
- **Lightweight** - no database dependency, in-memory cache only

## Install

```bash
npm install api-framework
```

Global install:

```bash
npm install -g api-framework
```

## Quick Start

```bash
# create a new project
npx api-framework init my-project

# enter directory
cd my-project

# start development mode
npm run dev
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `init <name>` | Create a new project |
| `dev` | Development mode (hot reload) |
| `start` | Production mode |
| `generate module <name>` | Generate a module template |
| `generate plugin <name>` | Generate a plugin template |

## Writing Modules

### Function Style (recommended)

File `module/user_info.js` maps to route `/user/info`. Underscores `_` are converted to slashes `/`.

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

### Object Style

Use when you need a custom route or HTTP method:

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

## ctx and core

### ctx (request context)

| Property | Type | Description |
|----------|------|-------------|
| query | object | Merged request params (query + body + files) |
| body | object | Request body |
| cookies | object | Parsed cookie object |
| files | object | Uploaded files |
| headers | object | Request headers |
| method | string | HTTP method |
| path | string | Request path |
| ip | string | Client IP |

### core (core utilities)

| Property | Type | Description |
|----------|------|-------------|
| request | function | HTTP request engine (axios wrapper) |
| logger | object | Level-based logger |
| config | object | Current configuration |
| cache | object | In-memory cache instance |
| req | object | Express req object |
| res | object | Express res object |

## Writing Plugins

Plugins support 5 lifecycle hooks, executed in order:

```javascript
module.exports = {
  name: 'my-plugin',

  // before server starts, can modify app and config
  beforeServer: async ({ app, config }) => {},

  // after all routes are registered
  afterRoutes: async ({ app, config }) => {},

  // before each request is processed
  beforeRequest: async ({ req, res, module }) => {},

  // after each request is processed
  afterRequest: async ({ req, res, module, result }) => {},

  // when a request handler throws an error
  onError: async ({ req, res, module, error }) => {},
}
```

## Configuration

Configure via `.env` file or environment variables:

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

Or override framework defaults via `config.js` in project root:

```javascript
module.exports = {
  port: 3000,
  host: '0.0.0.0',
}
```

## npm Library Usage

```javascript
const api = require('api-framework')

// start server
const app = await api.server.createApp()
await api.server.startServer(app, 3000, '0.0.0.0')

// call module methods directly
const result = await api.user_info({ id: '123' })
```

## Project Structure

```
my-project/
├── config.js        # configuration
├── .env             # environment variables
├── module/          # API modules
│   ├── example.js
│   └── ...
├── plugins/         # plugins
│   └── ...
├── util/            # utilities
│   ├── index.js
│   └── encrypt/     # encryption examples
│       ├── aes.js
│       ├── rsa.js
│       └── md5.js
└── public/          # static files
```

## Relationship with api-enhanced

api-framework is a generic extraction of the [api-enhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) architecture. Key differences:

- api-enhanced is specific to Netease Cloud Music API with built-in platform encryption
- api-framework is a general-purpose framework without any platform-specific encryption; users implement encryption in util/encrypt/

## License

MIT
