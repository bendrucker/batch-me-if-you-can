'use strict';

var Promise   = require('bluebird');
var boom      = require('boom');
var internals = {};

exports.handler = function (batch, reply) {
  if (!batch.payload.requests) {
    return reply(boom.badRequest('Missing requests array'));
  }
  Promise.map(batch.payload.requests, function (request) {
    return batch.server.injectThen({
      url: request.path,
      method: request.method,
      headers: batch.headers,
      payload: request.payload,
      session: batch.session
    })
    .get('result');
  })
  .done(reply);
};
