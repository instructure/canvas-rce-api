"use strict";

const { LogicalException } = require("node-exceptions");

class ConfigRequiredException extends LogicalException {
  static forPath(path) {
    return new this(`Configuration required for "${path}"`);
  }
}

module.exports = ConfigRequiredException;
