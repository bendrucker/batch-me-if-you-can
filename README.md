batch-me-if-you-can [![Build Status](https://travis-ci.org/bendrucker/batch-me-if-you-can.svg?branch=master)](https://travis-ci.org/bendrucker/batch-me-if-you-can) [![NPM version](https://badge.fury.io/js/batch-me-if-you-can.svg)](http://badge.fury.io/js/batch-me-if-you-can)
===================

Batch requests for Hapi with simple configuration. Works best when you use UUIDs as your primary keys. If you need path pipelining (using the result from one request to determine the path for the next) you should use [bassmaster](https://github.com/hapijs/bassmaster).

## Setup

```bash
$ npm install batch-me-if-you-can inject-then
```

```js
server.pack.register(require('inject-then'), function (err) {
  if (err) throw err;
});
server.pack.register({
  plugin: require('batch-me-if-you-can'),
  options: {}
}, function (err) {
  if (err) throw err;
});
```

#### Options
* `path` (string, default=`'/batch'`): The path for the batch route. 
* `parallel` (boolean, default=`true`): Global setting that determines whether batches are run in parallel or in series. Can be overriden by individual requests.
