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
    server.route([
      {
        method: 'get',
        path: '/users/0',
        handler: function (request, reply) {
          reply({
            id: 0,
            name: 'Ben'
          });
        }
      },
      {
        method: 'post',
        path: '/users',
        handler: function (request, reply) {
          reply({
            id: 1,
            name: 'Ben 2'
          });
        }
      },
      {
        method: 'get',
        path: '/messages/0',
        handler: function (request, reply) {
          reply({
            id: 0,
            message: 'Hello world!',
            user_id: 0
          });
        }
      },
      {
        method: 'post',
        path: '/messages',
        handler: function (request, reply) {
          reply({
            id: 1,
            message: 'Get hapi',
            user_id: request.payload.user_id
          });
        }
      }
    ]);
  });

  var request = function (requests) {
    return server.injectThen({
      method: 'post',
      url: '/batch',
      payload: {
        requests: requests
      }
    });
  };

  it('rejects requests with no requests array', function () {
    return request().then(function (response) {
      expect(response.statusCode).to.equal(400);
      expect(response.result.message).to.equal('Missing requests array');
    });
  });

  it('can batch a single request', function () {
    return request([{
      method: 'get',
      path: '/users/0'
    }])
    .then(function (response) {
      expect(response.result).to.deep.equal([{
        id: 0,
        name: 'Ben'
      }]);
    });
  });

  it('can batch many get requests', function () {
    return request([
      {
        method: 'get',
        path: '/users/0'
      },
      {
        method: 'get',
        path: '/messages/0'
      }
    ])
    .then(function (response) {
      expect(response.result).to.deep.equal([
        {
          id: 0,
          name: 'Ben'
        },
        {
          id: 0,
          message: 'Hello world!',
          user_id: 0
        }
      ]);
    });
  });

});
