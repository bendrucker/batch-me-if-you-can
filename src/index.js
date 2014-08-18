'use strict';

var batch = require('./batch');

exports.register = function (plugin, options, next) {
  plugin.route({
    method: 'post',
    path: '/batch',
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
