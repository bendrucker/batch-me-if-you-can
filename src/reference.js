'use strict';

var getObject = require('getobject');

var regex = /(?:\${2}(\d)+\.)?([^\/\$]*)/;

exports.isReference = function (input) {

  return input && typeof input === 'string' && input.match(regex)[1];
}

exports.parse = function (string) {
  var matches = string.match(regex);
  return {
    input: string,
    index: parseInt(matches[1]),
    property: matches[2]
  };
};

exports.get = function (source, property) {
  return getObject.get(source, property);
};
