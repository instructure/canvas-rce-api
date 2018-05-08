"use strict";

const { LogicalException } = require("node-exceptions");

class HandledException extends LogicalException {
  responseStatus() {
    return this.status || 500;
  }

  handle(req, res, next) {
    res.status(this.responseStatus());
    res.end(this.message);
    next();
  }
}

module.exports = HandledException;
