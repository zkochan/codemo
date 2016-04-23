'use strict'
module.exports = stdoutToDemo

const SourceMapConsumer = require('source-map').SourceMapConsumer
const normalizeNewline = require('normalize-newline')
const getOutputs = require('./get-outputs')
const mergeCodeWithDemo = require('./merge-code-with-demo')

function stdoutToDemo (opts) {
  if (typeof opts === 'string') opts = { code: opts }
  opts.cwd = opts.cwd || process.cwd()
  opts.code = normalizeNewline(opts.code)

  return getOutputs(opts)
    .then(outputs => {
      if (!opts.map) {
        return mergeCodeWithDemo({
          code: opts.code,
          outputs,
        })
      }
      const consumer = new SourceMapConsumer(opts.map)
      const originalOutputs = outputs
        .map(output => Object.assign({}, output, consumer.originalPositionFor({
          line: output.line,
          column: output.column,
        })))
      const sourcesContent = JSON.parse(opts.map).sourcesContent
      const sourceContent = sourcesContent[sourcesContent.length - 1]
      return mergeCodeWithDemo({
        code: sourceContent,
        outputs: originalOutputs,
      })
    })
}
