'use strict';

var hapi   = require('hapi');
var expect = require('chai').expect;

describe('Batch Endpoint', function () {

  var server;
  before(function () {
    server = new hapi.Server();
    server.pack.register([
      require('../'),
      require('inject-then')
    ], function (err) {
      expect(err).to.not.be.ok;
    });
  });

  it('rejects requests with no requests array', function () {
    return server.injectThen({
      method: 'post',
      url: '/batch'
    })
    .then(function (response) {
      expect(response.statusCode).to.equal(400);
      expect(response.result.message).to.equal('Missing requests array');
    });
  });

});
