"use strict";

const HandledException = require("./HandledException");

class TokenInvalidException extends HandledException {
  static before() {
    const msg = "Authentication token not valid yet";
    return new this(msg, 401, "E_TOKEN_BEFORE_NBF");
  }

  static expired() {
    const msg = "Authentication token expired";
    return new this(msg, 401, "E_TOKEN_AFTER_EXP");
  }

  static parse(originalError) {
    const msg = "Authentication token invalid";
    const err = new this(msg, 401, "E_TOKEN_PARSE_ERROR");
    err.originalError = originalError;
    return err;
  }
}

module.exports = TokenInvalidException;
