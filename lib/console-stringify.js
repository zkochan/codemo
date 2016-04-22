'use strict'
module.exports = consoleStringify

const removeLastEOL = require('./remove-last-eol')

function consoleStringify () {
  const originalWrite = process.stdout.write

  let message
  process.stdout.write = msg => { message = msg }

  console.log.apply(console, arguments)

  process.stdout.write = originalWrite

  return removeLastEOL(message)
}
