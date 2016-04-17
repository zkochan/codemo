'use strict'
const codemo = require('..')

codemo
  .process("console.log('Hello world!')")
  .then(result => console.log(result))

codemo
  .processFile('./hello-world-twice.js', { es6: true })
  .then(result => console.log(result))
