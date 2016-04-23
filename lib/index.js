'use strict'
module.exports = {
  process: codemoProcess,
  processFile,
}

const path = require('path')
const stdoutToDemo = require('./stdout-to-demo')
const fs = require('fs')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const includePaths = require('rollup-plugin-includepaths')

function codemoProcess (code, opts) {
  opts = opts || {}
  const cwd = opts.cwd || process.cwd()

  if (!opts.es6) {
    return stdoutToDemo({ code, cwd })
  }

  const tmpFileName = path.resolve(cwd, `${Math.random()}.js`)
  return new Promise((resolve, reject) => {
    fs.write(tmpFileName, code, 'utf8', err => {
      if (err) {
        return reject(err)
      }

      processFile(tmpFileName, opts)
        .then(md => {
          cleanUp()
          resolve(md)
        })
        .catch(err => {
          cleanUp()
          reject(err)
        })

      function cleanUp () {
        try {
          fs.unlinkSync(tmpFileName)
        } catch (err) {
          console.log(err)
        }
      }
    })
  })
}

function processFile (filePath, opts) {
  opts = opts || {}

  if (!opts.es6) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, code) => {
        if (err) return reject(err)

        codemoProcess(code, { cwd: path.dirname(filePath) })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  return rollup.rollup({
    entry: filePath,
    plugins: [
      includePaths({
        paths: [path.dirname(filePath)],
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  })
  .then(bundle => bundle.generate({
    format: 'cjs',
    sourceMap: true,
  }))
  .then(result => stdoutToDemo(Object.assign({}, result, {
    cwd: path.dirname(filePath),
  })))
}
