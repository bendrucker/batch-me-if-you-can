'use strict';

var Promise   = require('bluebird');
var boom      = require('boom');
var internals = {};

exports.handler = function (batch, reply) {
  if (!Array.isArray(batch.payload.requests)) {
    return reply(boom.badRequest('Missing requests array'));
  }
  var responses;
  if (internals.containsReferences(batch)) {
    responses = Promise
      .reduce(batch.payload.requests, function (requests, request) {
        requests.push(request);
        return requests;
      }, [])
      .reduce(function (responses, request) {
        return internals.inject(request, batch)
          .bind(responses)
          .then(responses.push)
          .return(responses);
      }, []);
  }
  else {
    responses = Promise.map(batch.payload.requests, function (request) {
      return internals.inject(request, batch);
    });
  }
  
  responses.done(reply);
};

internals.containsReferences = function (batch) {
  return batch.payload.requests.some(function (request) {
    return request.references && request.references.length;
  });
};

internals.inject = function (request, batch) {
  return batch.server.injectThen({
    url: request.path,
    method: request.method,
    headers: batch.headers,
    payload: request.payload,
    session: batch.session
  })
  .get('result');
};
