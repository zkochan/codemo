// this code should work in nodejs 0.10
'use strict'
module.exports = hookConsoleLog
module.exports.addHook = addHook
var messageSplitter = module.exports.messageSplitter = '\n$\n'

var callsites = require('callsites')
var normalizePath = require('normalize-path')
var slice = Array.prototype.slice

var originalLog = console.log

function hookConsoleLog (filePath, opts) {
  opts = opts || {}

  console.log = function () {
    var site = callsiteForFile(filePath)

    originalLog(messageSplitter + JSON.stringify({
      args: slice.call(arguments),
      line: site.line - opts.lineOffset,
      column: site.column,
    }))
  }
}

function callsiteForFile (fileName) {
  var stack = trace()
  for (var i = 0; i < stack.length; i++) {
    if (stack[i].file === fileName) {
      return stack[i]
    }
  }
}

function trace () {
  return callsites().map(function (callsite) {
    var fn = callsite.getFileName()
    return {
      file: fn && normalizePath(fn) || '?',
      line: callsite.getLineNumber(),
      column: callsite.getColumnNumber(),
    }
  })
}

function addHook (opts) {
  return useStrictToBeginning(
    "require('" + normalizePath(__filename) + "')('" + opts.filePath + "', {lineOffset: 1});\n" + opts.code // eslint-disable-line no-path-concat
  )
}

// this is needed because the 'use strict' statement has to be before any
// other statement in the file
function useStrictToBeginning (code) {
  if (!code.match(/['"]use strict['"]/)) {
    return code
  }
  return "'use strict';" + code
}
