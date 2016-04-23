'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const stdoutToDemo = require('./stdout-to-demo')

describe('stdoutToDemo', () => {
  it('should add the console output to the comments', () => {
    return stdoutToDemo('console.log("Hello world!")')
      .then(actual =>
        expect(actual).to.eq('console.log("Hello world!")\n//> Hello world!')
      )
  })

  it('should add the console output to the comments when the code executed asynchronously', () => {
    return stdoutToDemo('setTimeout(() => console.log("Hello world!"), 0)')
      .then(actual =>
        expect(actual).to.eq('setTimeout(() => console.log("Hello world!"), 0)\n//> Hello world!')
      )
  })

  it('should add the multiline console output to the comments', () => {
    return stdoutToDemo('console.log("Hello world!\\nHello world!")')
      .then(actual =>
        expect(actual).to.eq([
          'console.log("Hello world!\\nHello world!")',
          '//> Hello world!',
          '//  Hello world!',
        ].join('\n'))
      )
  })

  it('should add several console outputs printed by the same line to the comments', () => {
    return stdoutToDemo('"use strict";for (let i = 3; i--;) console.log("Hello world!")')
      .then(actual =>
        expect(actual).to.eq('"use strict";for (let i = 3; i--;) console.log("Hello world!")\n//> Hello world!\n//> Hello world!\n//> Hello world!')
      )
  })

  it('should add several console outputs printed by different lines', () => {
    return stdoutToDemo([
      'console.log("foo")',
      'console.log("bar")',
    ].join('\n'))
      .then(actual =>
        expect(actual).to.eq([
          'console.log("foo")',
          '//> foo',
          'console.log("bar")',
          '//> bar',
        ].join('\n'))
      )
  })

  it('should add the JSON console output to the comments', () => {
    return stdoutToDemo('console.log({foo: "bar"})')
      .then(actual =>
        expect(actual).to.eq('console.log({foo: "bar"})\n//> { foo: \'bar\' }')
      )
  })

  it('should add the console output immediately after console.log', () => {
    return stdoutToDemo([
      'function foo (a) {',
      '  console.log(a)',
      '  console.log(a + "\\n" + a)',
      '}',
      'foo("Hello world!")',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'function foo (a) {',
        '  console.log(a)',
        '  //> Hello world!',
        '  console.log(a + "\\n" + a)',
        '  //> Hello world!',
        '  //  Hello world!',
        '}',
        'foo("Hello world!")',
      ].join('\n'))
    )
  })

  it('should work with windows new lines', () => {
    return stdoutToDemo([
      'function foo (a) {\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n',
      '  console.log(a)',
      '}',
      'foo("Hello world!")',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'function foo (a) {\n\n\n\n\n\n\n\n\n\n\n\n',
        '  console.log(a)',
        '  //> Hello world!',
        '}',
        'foo("Hello world!")',
      ].join('\n'))
    )
  })

  it('should add the console output after the multiline console log statement', () => {
    return stdoutToDemo([
      'console.log([',
      '  1,',
      '  2,',
      '])',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'console.log([',
        '  1,',
        '  2,',
        '])',
        '//> [ 1, 2 ]',
      ].join('\n'))
    )
  })

  it('should add the console output after the multiline console log statement #2', () => {
    return stdoutToDemo([
      'console.log(',
      '  "foo"',
      ')',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'console.log(',
        '  "foo"',
        ')',
        '//> foo',
      ].join('\n'))
    )
  })

  it('should add multiple outputs from the same line below', () => {
    return stdoutToDemo([
      'for (var i = 0; i < 2; i++) {',
      '  console.log("Hello world!")',
      '}',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'for (var i = 0; i < 2; i++) {',
        '  console.log("Hello world!")',
        Array(2).fill('  //> Hello world!').join('\n'),
        '}',
      ].join('\n'))
    )
  })

  it('should parse properly glued output from child process', () => {
    return stdoutToDemo([
      'for (var i = 0; i < 100; i++) {',
      '  console.log("Hello world!")',
      '}',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'for (var i = 0; i < 100; i++) {',
        '  console.log("Hello world!")',
        Array(100).fill('  //> Hello world!').join('\n'),
        '}',
      ].join('\n'))
    )
  })

  it('should output multiline results', () => {
    return stdoutToDemo([
      'console.log(JSON.stringify({ foo: 1, bar: 2 }, null, 2))',
    ].join('\n'))
    .then(actual =>
      expect(actual).to.eq([
        'console.log(JSON.stringify({ foo: 1, bar: 2 }, null, 2))',
        '//> {',
        '//    "foo": 1,',
        '//    "bar": 2',
        '//  }',
      ].join('\n'))
    )
  })

  it('should output syntax error', done => {
    stdoutToDemo('+="')
      .catch(err => {
        expect(err).to.be.instanceOf(Error)
        expect(err.message).to.match(/SyntaxError: Unexpected token \+=/)
        done()
      })
  })
})
