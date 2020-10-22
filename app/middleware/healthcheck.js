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
  const v = getVersion();
  return healthcheck({
    healthy: () => ({ everything: "is ok", version: `${v}` }),
    test: combineTests.bind(null, [fsHealthy])
  });
}

function getVersion() {
  let version = 0;
  try {
    const fs = require("fs");
    const packageJson = fs.readFileSync("./package.json");
    return JSON.parse(packageJson).version || 0;
  } catch (_ex) {
    // ignore
  }
  return version;
}

module.exports = buildMiddleware;
module.exports.fsHealthy = fsHealthy;
module.exports.combineTests = combineTests;
