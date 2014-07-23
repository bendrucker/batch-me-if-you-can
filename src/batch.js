'use strict';

var Promise   = require('bluebird');
var boom      = require('boom');
var internals = {};

exports.handler = function (request, reply) {
  if (!request.payload.requests) {
    return reply(boom.badRequest('Missing requests array'));
  }
};
