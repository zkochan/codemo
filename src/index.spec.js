import {describe, it} from 'mocha'
import {expect} from 'chai'
import {processFile} from './'
import path from 'path'

describe('codemo', () => {
  it('should generate example from a file', () => {
    return processFile(path.resolve(__dirname, './test/hello-world-example.js'))
      .then(actual => {
        expect(actual).to.eq([
          "console.log('Hello world!')",
          '//> Hello world!',
          '',
        ].join('\n'))
      })
  })

  it('should work with requires', () => {
    return processFile(path.resolve(__dirname, './test/require-example/example.js'))
      .then(actual => {
        expect(actual).to.eq([
          "'use strict'",
          "var fooBar = require('./index')",
          'console.log(fooBar)',
          '//> Hello world!',
          '',
        ].join('\n'))
      })
  })

  it('should work with imports', () => {
    return processFile(path.resolve(__dirname, './test/import-example/example.js'), {es6: true})
      .then(actual => {
        expect(actual).to.eq([
          "import fooBar from './index'",
          'console.log(fooBar)',
          '//> Hello world!',
          '',
        ].join('\n'))
      })
  })

  it('should generate example from an es6 file', () => {
    return processFile(path.resolve(__dirname, './test/hello-world-example.es6.js'), {es6: true})
      .then(actual => {
        expect(actual).to.eq([
          "'use strict'",
          "var s = 'Hello world!'",
          'console.log(s)',
          '//> Hello world!',
          '',
        ].join('\n'))
      })
  })
})
