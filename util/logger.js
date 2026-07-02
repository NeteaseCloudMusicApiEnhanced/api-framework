/**
 * 轻量级日志工具
 * 带颜色输出和分级控制
 */
'use strict'

const chalk = require('chalk')

const levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

const levelColors = {
  debug: chalk.gray,
  info: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
}

const levelPrefixes = {
  debug: '[DEBUG]',
  info: '[INFO]',
  warn: '[WARN]',
  error: '[ERROR]',
}

class Logger {
  constructor(level = 'info') {
    this.setLevel(level)
  }

  setLevel(level) {
    this.level = levels[level] !== undefined ? levels[level] : levels.info
  }

  _log(level, msg, ...args) {
    if (levels[level] < this.level) return

    const prefix = levelPrefixes[level]
    const color = levelColors[level]
    const timestamp = chalk.gray(new Date().toISOString().split('T')[1].split('.')[0])

    if (args.length > 0) {
      console.log(`${timestamp} ${color(prefix)} ${msg}`, ...args)
    } else {
      console.log(`${timestamp} ${color(prefix)} ${msg}`)
    }
  }

  debug(msg, ...args) {
    this._log('debug', msg, ...args)
  }

  info(msg, ...args) {
    this._log('info', msg, ...args)
  }

  warn(msg, ...args) {
    this._log('warn', msg, ...args)
  }

  error(msg, ...args) {
    this._log('error', msg, ...args)
  }

  success(msg, ...args) {
    const timestamp = chalk.gray(new Date().toISOString().split('T')[1].split('.')[0])
    if (args.length > 0) {
      console.log(`${timestamp} ${chalk.green.bold('[SUCCESS]')} ${msg}`, ...args)
    } else {
      console.log(`${timestamp} ${chalk.green.bold('[SUCCESS]')} ${msg}`)
    }
  }
}

module.exports = new Logger()
