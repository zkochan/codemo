import removeLastEOL from './remove-last-eol'

export default function consoleStringify (...args) {
  const originalWrite = process.stdout.write

  let message
  process.stdout.write = msg => { message = msg }

  console.log(...args)

  process.stdout.write = originalWrite

  return removeLastEOL(message)
}
