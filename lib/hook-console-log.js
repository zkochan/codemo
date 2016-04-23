'use strict'
module.exports = hookConsoleLog

const callsites = require('callsites')
const normalizePath = require('normalize-path')
const slice = Array.prototype.slice

const originalLog = console.log

function hookConsoleLog (filePath, opts) {
  opts = opts || {}

  console.log = function () {
    const site = callsiteForFile(filePath)

    originalLog('\n$\n' + JSON.stringify({
      args: slice.call(arguments),
      line: site.line - opts.lineOffset,
      column: site.column,
    }))
  }
}

function callsiteForFile (fileName) {
  const stack = trace()
  return stack.find(callsite => callsite.file === fileName)
}

function trace () {
  return callsites().map(callsite => ({
    file: normalizePath(callsite.getFileName()) || '?',
    line: callsite.getLineNumber(),
    column: callsite.getColumnNumber(),
  }))
}
