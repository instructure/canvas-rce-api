"use strict";

const { LogicalException } = require("node-exceptions");

class EnvRequiredException extends LogicalException {
  static forVar(name) {
    return new this(`Environment variable "${name}" is required`);
  }
}

module.exports = EnvRequiredException;
