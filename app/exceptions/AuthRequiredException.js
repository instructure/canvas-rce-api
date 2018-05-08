"use strict";

const HandledException = require("./HandledException");

class AuthRequiredException extends HandledException {
  static tokenMissing() {
    return new this("Authorization token required", 401);
  }
}

module.exports = AuthRequiredException;
