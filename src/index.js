'use strict';

var batch = require('./batch');
var hoek  = require('hoek');

exports.register = function (server, options, next) {
  var config = hoek.applyToDefaults({
    path: '/batch',
    parallel: true
  }, options);
  server.route({
    method: 'post',
    path: config.path,
    handler: batch.handler,
    config: {
      validate: {
        payload: batch.validate
      },
      plugins: {
        'batch-me-if-you-can': config
      }
    }
  });
  server.dependency('inject-then');
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
