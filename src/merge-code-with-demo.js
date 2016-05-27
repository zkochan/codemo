import consoleStringify from './console-stringify'
import partition from 'lodash.partition'
import * as acorn from 'acorn'
import * as walk from 'acorn/dist/walk'
import position from 'file-position'

export default function mergeCodeWithDemo (opts) {
  const codeLines = splitIntoLines(opts.code)
  const sOutputs = moveOutputsBeloveStatement(opts.outputs, codeLines, opts.code)

  return codeLines.reduce((acc, line, index) => {
    const lineNo = index + 1
    const partResult = partition(acc.outputs, ['line', lineNo])
    const lineOutputs = partResult[0]
    return {
      outputs: partResult[1],
      codeLines: [
        ...acc.codeLines,
        line,
        ...outputsToDemo(lineOutputs, {
          prevLine: line,
        }),
      ],
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
    .map(outputArgs => consoleStringify(...outputArgs))
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
    return [
      ...semanticOutput,
      {
        ...output,
        line: semanticLineNo,
      },
    ]
  }, [])
}

function splitIntoLines (txt) {
  return txt.split('\n')
}

function outputSemanticPosition (ast, pos) {
  const node = walk.findNodeAround(ast, pos, 'ExpressionStatement')
  return node.node.loc.end.line
}
