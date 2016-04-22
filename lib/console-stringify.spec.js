'use strict'
const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const consoleStringify = require('./console-stringify')

describe('consoleStringify', () => {
  it('should stringify number', () => {
    expect(consoleStringify(1)).to.eq('1')
  })

  it('should stringify object', () => {
    expect(consoleStringify({a: 'foo'})).to.eq("{ a: 'foo' }")
  })
})
