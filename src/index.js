'use strict';

var batch = require('./batch');
var hoek  = require('hoek');

exports.register = function (plugin, options, next) {
  var config = hoek.applyToDefaults({
    path: '/batch',
    parallel: true
  }, options || {});
  plugin.route({
    method: 'post',
    path: config.path,
    handler: batch.handler,
    config: {
      validate: {
        payload: batch.validate
      }
    }
  });
  plugin.dependency('inject-then');
  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
