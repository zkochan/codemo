import {SourceMapConsumer} from 'source-map'
import normalizeNewline from 'normalize-newline'
import getOutputs from './get-outputs'
import mergeCodeWithDemo from './merge-code-with-demo'

export default function stdoutToDemo (opts) {
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
        .map(output => ({
          ...output,
          ...consumer.originalPositionFor({
            line: output.line,
            column: output.column,
          }),
        }))
      const sourcesContent = JSON.parse(opts.map).sourcesContent
      const sourceContent = sourcesContent[sourcesContent.length - 1]
      return mergeCodeWithDemo({
        code: sourceContent,
        outputs: originalOutputs,
      })
    })
}
