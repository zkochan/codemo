<!--@'# ' + pkg.name-->
# codemo
<!--/@-->

<!--@'> ' + pkg.description-->
> Embeds console output to the code
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![npm version](https://img.shields.io/npm/v/codemo.svg?style=flat-square)](https://www.npmjs.com/package/codemo) [![Build Status](https://img.shields.io/travis/zkochan/codemo/master.svg?style=flat-square)](https://travis-ci.org/zkochan/codemo) [![Coverage Status](https://img.shields.io/coveralls/zkochan/codemo/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/codemo?branch=master)
<!--/@-->

## Installation

```sh
npm i -S codemo
```

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

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
