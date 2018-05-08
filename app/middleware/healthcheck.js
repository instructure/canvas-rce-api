"use strict";

const healthcheck = require("express-healthcheck");
const fs = require("fs");

function fsHealthy(callback) {
  fs.stat("/tmp", (err, stats) => {
    if (err || !stats.isDirectory()) {
      return callback({
        state: "unhealthy",
        reason: "Filesystem in unexpected state"
      });
    }
    callback();
  });
}

function combineTests(tests, callback) {
  const [next, ...remaining] = tests;
  next(state => {
    if (!state && remaining.length > 0) {
      combineTests(remaining, callback);
    } else {
      callback(state);
    }
  });
}

function buildMiddleware() {
  return healthcheck({
    healthy: () => ({ everything: "is ok" }),
    test: combineTests.bind(null, [fsHealthy])
  });
}

module.exports = buildMiddleware;
module.exports.fsHealthy = fsHealthy;
module.exports.combineTests = combineTests;
