import {describe, it} from 'mocha'
import {expect} from 'chai'
import consoleStringify from './console-stringify'

describe('consoleStringify', () => {
  it('should stringify number', () => {
    expect(consoleStringify(1)).to.eq('1')
  })

  it('should stringify object', () => {
    expect(consoleStringify({a: 'foo'})).to.eq("{ a: 'foo' }")
  })
})
