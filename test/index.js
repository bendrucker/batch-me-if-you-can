'use strict';

var Promise = require('bluebird');
var hapi    = require('hapi');
var joi     = require('joi');
var expect  = require('chai').expect;
var hoek    = require('hoek');
var boom    = require('boom');

describe('batch-me-if-you-can', function () {

  Promise.longStackTraces();

  var server;
  beforeEach(function () {
    server = new hapi.Server();
  });

  function throwIf (err) {
    if (err) throw err;
  }

  function register (options) {
    options = options || {};
    server.pack.register({
      plugin: require('../'),
      options: options
    }, throwIf);
    server.pack.register(require('inject-then'), throwIf);
    server.route([
      {
        method: 'post',
        path: '/echo',
        handler: echo
      },
      {
        method: 'get',
        path: '/delay/{delay?}',
        handler: function (request, reply) {
          setTimeout(function () {
            reply(Date.now());
          }, request.params.delay);
        },
        config: {
          validate: {
            params: {
              delay: joi.number()
            }
          }
        }
      },
      {
        method: 'get',
        path: '/error',
        handler: function (request, reply) {
          reply(boom.notFound());
        }
      }
    ]);
  }

  function batch (requests, options) {
    options = hoek.applyToDefaults({
      path: '/batch'
    }, options || {});
    return server.injectThen({
      method: 'post',
      url: options.path,
      payload: JSON.stringify({
        parallel: options.parallel,
        requests: requests
      })
    });
  }

  function echo (request, reply) {
    reply(request.payload);
  }

  it('handles batch requests at /batch by default', function () {
    register();
    return batch([{
      method: 'post',
      path: '/echo',
      payload: 'Hello!'
    }],
    {
      path: '/batch'
    })
    .then(function (response) {
      expect(response.result[0]).to.equal('Hello!');
    });
  });

  it('can set a custom batch path', function () {
    register({
      path: '/custom-batch'
    });
    return batch([{
      method: 'post',
      path: '/echo',
      payload: 'Hello!'
    }],
    {
      path: '/custom-batch'
    })
    .then(function (response) {
      expect(response.result[0]).to.equal('Hello!');
    });
  });

  it('rejects batch requests with no requests array', function () {
    register();
    return batch().then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('rejects batch requests with empty requests array', function () {
    register();
    return batch([]).then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('rejects requests with a non-array on requests', function () {
    register();
    return batch({}).then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('rejects requests missing a path', function () {
    register();
    return batch([{}]).then(function (response) {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('can batch simple requests', function () {
    register();
    var request = {
      method: 'post',
      path: '/echo',
      payload: {
        hello: 'world'
      }
    };
    return batch([request, request])
    .then(function (response) {
      expect(response.result).to.deep.equal([{hello: 'world'}, {hello: 'world'}]);
    });
  });

  it('can batch JSON requests', function () {
    register();
    var request = {
      method: 'post',
      path: '/echo',
      payload: 'Hello!'
    };
    return batch([request, request])
    .then(function (response) {
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(['Hello!', 'Hello!']);
    });
  });

  it('executes requests in parallel by default', function () {
    register();
    return batch([{path: '/delay/10'}, {path: '/delay/0'}])
      .then(function (response) {
        expect(response.result[0]).to.be.above(response.result[1]);
      });
  });

  it('can set batches to run in sequence by default', function () {
    register({
      parallel: false
    });
    return batch([{path: '/delay/10'}, {path: '/delay/0'}])
      .then(function (response) {
        expect(response.result[0]).to.be.below(response.result[1]);
      });
  });

  it('can apply a parallel override from the batch', function () {
    register();
    return batch([{path: '/delay/10'}, {path: '/delay/0'}], {parallel: false})
      .then(function (response) {
        expect(response.result[0]).to.be.below(response.result[1]);
      });
  });

  it('includes error responses directly', function () {
    register();
    return batch([{path: '/error'}])
      .then(function (response) {
        expect(response.statusCode).to.equal(200);
        expect(response.result[0]).to.deep.equal({
          statusCode: 404,
          error: 'Not Found'
        });
      });
  });

});
