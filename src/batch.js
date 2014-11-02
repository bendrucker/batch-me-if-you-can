'use strict';

var Promise = require('bluebird');
var hoek    = require('hoek');
var joi     = require('joi');

exports.handler = function (batch, reply) {

  var config = hoek.applyToDefaults(batch.route.plugins['batch-me-if-you-can'], {
    parallel: batch.payload.parallel
  });
  var responses;
  if (config.parallel) {
    responses = Promise.map(batch.payload.requests, function (request) {
      return inject(request, batch);
    });
  }
  else {
    responses = Promise
      .reduce(batch.payload.requests, function (responses, request) {
        return inject(request, batch)
          .bind(responses)
          .then(responses.push)
          .return(responses);
      }, []);
  }
  
  responses.done(reply);
};

exports.validate = joi.object().keys({
  parallel: joi.boolean(),
  requests: joi.array().required().min(1).includes(joi.object().keys({
    path: joi.string().required(),
    payload: joi.any(),
    method: joi.string().default('get')
  }))
});

function inject (request, batch) {
  return batch.server.injectThen({
    url: request.path,
    method: request.method,
    headers: batch.headers,
    payload: JSON.stringify(request.payload),
    session: batch.session
  })
  .get('result');
}
