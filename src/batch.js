'use strict';

var Promise    = require('bluebird');
var boom       = require('boom');
var traverse   = require('traverse');
var reference  = require('./reference');
var internals  = {};

exports.handler = function (batch, reply) {
  if (!Array.isArray(batch.payload.requests)) {
    return reply(boom.badRequest('Missing requests array'));
  }
  var responses;
  if (internals.containsReferences(batch)) {
    responses = Promise
      .reduce(batch.payload.requests, function (responses, request) {
        return internals.inject({
          path: internals.referencesIn(request, 'path')
            ? internals.path(request.path)
            : request.path,
          method: request.method,
          payload: internals.referencesIn(request, 'payload')
            ? internals.payload(request.payload, responses)
            : request.payload
        }, batch)
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

internals.referencesIn = function (request, object) {
  return request.references && request.references.indexOf(object) !== -1;
};

internals.payload = function (payload, requests) {
  return traverse(payload).map(function (value) {
    if (this.isLeaf && reference.isReference(value)) {
      var ref = reference.parse(value);
      this.update(reference.get(requests[ref.index], ref.property));
    }
  });
};

internals.path = function (path) {
  return path;
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
