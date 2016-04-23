'use strict'
module.exports = stdoutToComments

const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const fs = require('fs')
const spawn = require('cross-spawn-async')
const path = require('path')
const SourceMapConsumer = require('source-map').SourceMapConsumer
const normalizePath = require('normalize-path')
const hookPath = normalizePath(path.resolve(__dirname, './hook-console-log'))
const position = require('file-position')
const normalizeNewline = require('normalize-newline')
const consoleStringify = require('./console-stringify')

function stdoutToComments (opts) {
  if (typeof opts === 'string') opts = { code: opts }

  const cwd = opts.cwd || process.cwd()

  return new Promise((resolve, reject) => {
    const content = normalizeNewline(opts.code)

    const tmpFileName = normalizePath(path.resolve(cwd, `_${Math.random()}.js`))
    fs.writeFileSync(tmpFileName, addHook({
      code: content,
      filePath: tmpFileName,
    }), 'utf8')

    const outputs = []
    let failed = false

    const cp = spawn('node', [tmpFileName])
    cp.stdout.setEncoding('utf8')
    cp.stderr.setEncoding('utf8')
    cp.stdout.on('data', data => {
      try {
        data.split('\n$\n')
          .filter(outputJSON => !!outputJSON)
          .map(outputJSON => JSON.parse(outputJSON))
          .forEach(outputInfo => outputs.push(outputInfo))
      } catch (err) {
        failed = true
        reject(err)
      }
    })
    let errData = ''
    cp.stderr.on('data', data => { errData += data })
    cp.on('close', code => {
      fs.unlinkSync(tmpFileName)

      if (errData) {
        return reject(new Error(errData))
      }

      if (failed) {
        return
      }

      if (!opts.map) {
        return resolve(insertOutputsToCode(content, outputs))
      }
      const consumer = new SourceMapConsumer(opts.map)
      const originalOutputs = outputs
        .map(output => Object.assign({}, output, consumer.originalPositionFor({
          line: output.line,
          column: output.column,
        })))
      const sourcesContent = JSON.parse(opts.map).sourcesContent
      const sourceContent = sourcesContent[sourcesContent.length - 1]
      resolve(insertOutputsToCode(sourceContent, originalOutputs))
    })
  })
}

function insertOutputsToCode (content, outputs) {
  const codeLines = splitIntoLines(content)
  const sOutputs = moveOutputsBeloveStatement(outputs, codeLines, content)

  return codeLines.reduce((contentLines, line, index) => {
    contentLines.push(line)
    const lineNo = index + 1
    while (sOutputs.length && sOutputs[0].line === lineNo) {
      const matches = (contentLines[contentLines.length - 1] || '').match(/^(\s*)/)
      const linePadding = matches && matches[0] || ''
      const output = consoleStringify.apply(null, sOutputs.shift().args)
      contentLines.push(outputToComment(output, linePadding))
    }
    return contentLines
  }, []).join('\n')
}

function outputToComment (output, padding) {
  return `${padding}//> ${output.replace(/\r?\n/g, `\n${padding}//  `)}`
}

function moveOutputsBeloveStatement (outputs, codeLines, content) {
  const ast = acorn.parse(content, {locations: true, sourceType: 'module'})
  const getPosition = position(content)

  return outputs.reduce((semanticOutput, output) => {
    const pos = getPosition(output.line - 1, output.column)
    const semanticLineNo = outputSemanticPosition(ast, pos)
    return semanticOutput.concat(Object.assign(
      {},
      output,
      {
        line: semanticLineNo,
      }
    ))
  }, [])
}

function splitIntoLines (txt) {
  return txt.split('\n')
}

function outputSemanticPosition (ast, pos) {
  const node = walk.findNodeAround(ast, pos, 'ExpressionStatement')
  return node.node.loc.end.line
}

function addHook (opts) {
  if (!opts.code.match(/['"]use strict['"]/)) {
    return `require('${hookPath}')('${opts.filePath}');\n` + opts.code
  }
  return `'use strict';require('${hookPath}')('${opts.filePath}');\n` + opts.code
}
