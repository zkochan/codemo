'use strict'
module.exports = hookConsoleLog
module.exports.addHook = addHook
const messageSplitter = module.exports.messageSplitter = '\n$\n'

const callsites = require('callsites')
const normalizePath = require('normalize-path')
const slice = Array.prototype.slice

const originalLog = console.log

function hookConsoleLog (filePath, opts) {
  opts = opts || {}

  console.log = function () {
    const site = callsiteForFile(filePath)

    originalLog(messageSplitter + JSON.stringify({
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

function addHook (opts) {
  return useStrictToBeginning(
    `require('${__filename}')('${opts.filePath}', {lineOffset: 1});\n${opts.code}`
  )
}

// this is needed because the 'use strict' statement has to be before any
// other statement in the file
function useStrictToBeginning (code) {
  if (!code.match(/['"]use strict['"]/)) {
    return code
  }
  return `'use strict';${code}`
}
