'use strict';

var Promise   = require('bluebird');
var Joi       = require('joi');
var internals = {};

exports.handler = function (batch, reply) {

  var responses;
  
  if (batch.payload.parallel) {
    responses = Promise.map(batch.payload.requests, function (request) {
      return internals.inject(request, batch);
    });
  }
  else {
    responses = Promise
      .reduce(batch.payload.requests, function (responses, request) {
        return internals.inject(request, batch)
        .bind(responses)
        .then(responses.push)
        .return(responses);
      }, []);
  }
  
  responses.done(reply);
};

internals.requestSchema = Joi.object().keys({
  path: Joi.string().required(),
  payload: Joi.any(),
  method: Joi.string().default('get')
});

exports.validate = Joi.object().keys({
  parallel: Joi.boolean().default(true),
  requests: Joi.array().required().min(1).includes(internals.requestSchema)
});

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
