# batch-me-if-you-can
[![Build Status](https://travis-ci.org/bendrucker/batch-me-if-you-can.svg?branch=master)](https://travis-ci.org/bendrucker/batch-me-if-you-can) [![NPM version](https://badge.fury.io/js/batch-me-if-you-can.svg)](http://badge.fury.io/js/batch-me-if-you-can) [![Code Climate](https://codeclimate.com/github/bendrucker/batch-me-if-you-can/badges/gpa.svg)](https://codeclimate.com/github/bendrucker/batch-me-if-you-can) [![Test Coverage](https://codeclimate.com/github/bendrucker/batch-me-if-you-can/badges/coverage.svg)](https://codeclimate.com/github/bendrucker/batch-me-if-you-can)
===================

Batch request plugin for Hapi with simple configuration. Batch requests are ideal for applications with heavy mobile consumption since the latency associated with mobile networks makes multiple roundtrips expensive. This plugin works best when you use UUIDs as your primary keys. If you need path pipelining (using the result from one request to determine the path for the next) you should use [bassmaster](https://github.com/hapijs/bassmaster).

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

## Usage
You can send `POST` requests containing JSON to the batch endpoint. Each request must contain at least a `requests` array with one request. Each request must define at least a `path`.

If an individual request results in an error, the serialized error body will be sent in the response. The status code of a request should be `200` regardless of the outcome of individual requests within the batch.

See the [schema overview](SCHEMA.md) for more detail on the formatting of requests and replies. 
