'use strict'
module.exports = getOutputs

const fs = require('fs')
const spawn = require('cross-spawn-async')
const path = require('path')
const normalizePath = require('normalize-path')
const hookConsoleLog = require('./hook-console-log')

function getOutputs (opts) {
  const tmpFileName = normalizePath(path.resolve(opts.cwd, `_${Math.random()}.js`))
  fs.writeFileSync(tmpFileName, hookConsoleLog.addHook({
    code: opts.code,
    filePath: tmpFileName,
  }), 'utf8')

  return new Promise((resolve, reject) => {
    const outputs = []
    let failed = false

    const cp = spawn('node', [tmpFileName])
    cp.stdout.setEncoding('utf8')
    cp.stdout.on('data', data => {
      try {
        data.split(hookConsoleLog.messageSplitter)
          .filter(outputJSON => !!outputJSON)
          .map(outputJSON => JSON.parse(outputJSON))
          .forEach(outputInfo => outputs.push(outputInfo))
      } catch (err) {
        failed = true
        reject(err)
      }
    })
    let errData = ''

    cp.stderr.setEncoding('utf8')
    cp.stderr.on('data', data => { errData += data })

    cp.on('close', () => {
      fs.unlinkSync(tmpFileName)

      if (failed) {
        return
      }

      if (errData) {
        return reject(new Error(errData))
      }

      return resolve(outputs)
    })
  })
}
