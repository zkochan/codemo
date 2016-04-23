'use strict'
module.exports = stdoutToComments

const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const fs = require('fs')
const spawn = require('cross-spawn-async')
const path = require('path')
const SourceMapConsumer = require('source-map').SourceMapConsumer
const normalizePath = require('normalize-path')
const position = require('file-position')
const normalizeNewline = require('normalize-newline')
const consoleStringify = require('./console-stringify')
const partition = require('lodash.partition')
const hookConsoleLog = require('./hook-console-log')

function stdoutToComments (opts) {
  if (typeof opts === 'string') opts = { code: opts }

  const cwd = opts.cwd || process.cwd()

  return new Promise((resolve, reject) => {
    const code = normalizeNewline(opts.code)

    const tmpFileName = normalizePath(path.resolve(cwd, `_${Math.random()}.js`))
    fs.writeFileSync(tmpFileName, hookConsoleLog.addHook({
      code,
      filePath: tmpFileName,
    }), 'utf8')

    const outputs = []
    let failed = false

    const cp = spawn('node', [tmpFileName])
    cp.stdout.setEncoding('utf8')
    cp.stderr.setEncoding('utf8')
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
    cp.stderr.on('data', data => { errData += data })
    cp.on('close', () => {
      fs.unlinkSync(tmpFileName)

      if (errData) {
        return reject(new Error(errData))
      }

      if (failed) {
        return
      }

      if (!opts.map) {
        return resolve(insertOutputsToCode(code, outputs))
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

function insertOutputsToCode (code, outputs) {
  const codeLines = splitIntoLines(code)
  const sOutputs = moveOutputsBeloveStatement(outputs, codeLines, code)

  return codeLines.reduce((acc, line, index) => {
    const lineNo = index + 1
    const partResult = partition(acc.outputs, ['line', lineNo])
    const lineOutputs = partResult[0]
    return {
      outputs: partResult[1],
      codeLines: acc.codeLines
        .concat(line)
        .concat(outputsToDemo(lineOutputs, {
          prevLine: line,
        })),
    }
  }, {
    codeLines: [],
    outputs: sOutputs,
  }).codeLines.join('\n')
}

function outputsToDemo (lineOutputs, opts) {
  if (!lineOutputs.length) return []

  opts = opts || {}
  const prevLinePadding = getLinePadding(opts.prevLine)
  return lineOutputs
    .map(lineOutput => lineOutput.args)
    .map(outputArgs => consoleStringify.apply(null, outputArgs))
    .map(output => outputToDemo(output, {
      prevLinePadding,
    }))
}

function getLinePadding (line) {
  const matches = (line || '').match(/^(\s*)/)
  return matches && matches[0] || ''
}

function outputToDemo (output, opts) {
  const padding = opts.prevLinePadding
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
