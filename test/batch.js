'use strict';

var hapi   = require('hapi');
var expect = require('chai').use(require('sinon-chai')).expect;
var sinon  = require('sinon');

describe('Batch Endpoint', function () {

  var server;
  beforeEach(function () {
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
            name: request.payload.name
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
            message: request.payload.message,
            user_id: request.payload.user_id
          });
        }
      }
    ]);
  });

  var request = function (requests, parallel) {
    return server.injectThen({
      method: 'post',
      url: '/batch',
      payload: {
        parallel: parallel,
        requests: requests
      }
    });
  };

  it('rejects requests with no requests array', function () {
    return request().then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('rejects requests with empty requests array', function () {
    return request([]).then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('rejects requests with a non-array on requests', function () {
    return request({}).then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('rejects requests missing a path', function () {
    return request([{}]).then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('can batch a single request', function () {
    return request([{
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
        path: '/users/0'
      },
      {
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

  it('can batch many post requests', function () {
    return request([
      {
        method: 'post',
        path: '/users',
        payload: {
          name: 'BD'
        }
      },
      {
        method: 'post',
        path: '/messages',
        payload: {
          message: 'hi',
          user_id: 1
        }
      }
    ])
    .then(function (response) {
      expect(response.result).to.deep.equal([
        {
          id: 1,
          name: 'BD'
        },
        {
          id: 1,
          message: 'hi',
          user_id: 1
        }
      ]);
    });
  });

  it('executes requests in parallel by default', function () {
    var first  = sinon.spy();
    var second = sinon.spy();

    server.route([
      {
        method: 'get',
        path: '/first',
        handler: function (request, reply) {
          setTimeout(function () {
            first();
            reply();
          }, 10);
        }
      },
      {
        method: 'get',
        path: '/second',
        handler: function (request, reply) {
          second();
          reply();
        }
      }
    ]);

    return request([
      {
        method: 'get',
        path: '/first'  
      },
      {
        method: 'get',
        path: '/second'
      }
    ])
    .then(function (response) {
      expect(second).to.have.been.calledBefore(first);
    });

  });

  it('can execute requests sequentially', function () {
    var first  = sinon.spy();
    var second = sinon.spy();

    server.route([
      {
        method: 'get',
        path: '/first',
        handler: function (request, reply) {
          setTimeout(function () {
            first();
            reply();
          }, 10);
        }
      },
      {
        method: 'get',
        path: '/second',
        handler: function (request, reply) {
          second();
          reply();
        }
      }
    ]);

    return request([
      {
        method: 'get',
        path: '/first'  
      },
      {
        method: 'get',
        path: '/second'
      }
    ], false)
    .then(function (response) {
      expect(first).to.have.been.calledBefore(second);
    });

  });

});
