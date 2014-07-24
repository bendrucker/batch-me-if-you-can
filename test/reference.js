'use strict';

var expect     = require('chai').expect;
var references = require('../src/reference');

describe('Reference', function () {

  describe('#parse', function () {

    it('extracts references paramaters', function () {
      expect(references.parse('$$1.foo.bar.baz')).to.deep.equal({
        input: '$$1.foo.bar.baz',
        index: 1,
        property: 'foo.bar.baz'
      });
    });

  });

  describe('#get', function () {

    it('extracts a deep property', function () {
      expect(references.get({
        foo: {
          bar: {
            baz: 'qux'
          }
        }
      }, 'foo.bar.baz'))
      .to.equal('qux');
    });

  });

});
