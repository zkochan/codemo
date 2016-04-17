<!--@'# ' + package.name-->
# codemo
<!--/@-->

<!--@'> ' + package.description-->
> Embeds console output to the code
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/codemo.svg?style=flat-square)](https://www.npmjs.com/package/codemo)
[![Build status for master](https://img.shields.io/travis/zkochan/codemo/master.svg?style=flat-square)](https://travis-ci.org/zkochan/codemo)
[![Test coverage for master](https://img.shields.io/coveralls/zkochan/codemo/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/codemo?branch=master)
<!--/@-->

<!--@installation()-->
## Installation

This module is installed via npm:

``` sh
npm install codemo --save
```
<!--/@-->

## Usage

```js
const codemo = require('codemo')

codemo
  .process("console.log('Hello world!')")
  .then(result => consle.log(result))
```

The result will be

```js
console.log('Hello world!')
//> Hello world!
```

## API

### `codemo.process(code, [opts])`

Return a promise with the resulting file combined with output.

- `opts.cwd` - the directory in which the code should be executed
- `opts.es6` - whether the code is written using ES6

### `codemo.processFile(filePath, [opts])`

Return a promise with the resulting file combined with output.

- `opts.es6` - whether the code is written using ES6

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## Dependencies [![Dependency status for master](https://img.shields.io/david/zkochan/codemo/master.svg?style=flat-square)](https://david-dm.org/zkochan/codemo/master)

- [acorn](https://github.com/ternjs/acorn): ECMAScript parser
- [callsites](https://github.com/sindresorhus/callsites): Get callsites from the V8 stack trace API
- [cross-spawn-async](https://github.com/IndigoUnited/node-cross-spawn-async): Cross platform child_process#spawn
- [file-position](https://github.com/hughsk/file-position): Given a row/column number, return the index of that character within the whole string
- [normalize-newline](https://github.com/sindresorhus/normalize-newline): Normalize the newline characters in a string to `\n`
- [normalize-path](https://github.com/jonschlinkert/normalize-path): Normalize file path slashes to be unix-like forward slashes. Also condenses repeat slashes to a single slash and removes and trailing slashes.
- [rollup](https://github.com/rollup/rollup): Next-generation ES6 module bundler
- [rollup-plugin-babel](https://github.com/rollup/rollup-plugin-babel): Seamless integration between Rollup and Babel.
- [rollup-plugin-includepaths](https://github.com/dot-build/rollup-plugin-includepaths): Rollup plugin to use relative paths in your project files
- [source-map](https://github.com/mozilla/source-map): Generates and consumes source maps

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## Dev Dependencies [![devDependency status for master](https://img.shields.io/david/dev/zkochan/codemo/master.svg?style=flat-square)](https://david-dm.org/zkochan/codemo/master#info=devDependencies)

- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos](https://github.com/zkochan/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->
