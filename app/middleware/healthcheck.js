"use strict";

const fs = require("fs");

function defaultResponse() {
  return {
    components: [],
    name: "Rich Content Service",
    status: 200,
    version: `${getVersion()}`
  };
}

function defaultFSResponse() {
  return {
    message: "Filesystem healthy",
    name: "Filesystem",
    status: 200
  };
}

function fsHealthy(callback) {
  const state = defaultFSResponse();

  return new Promise(function(resolve, _reject) {
    fs.stat("/tmp", (err, stats) => {
      if (err || !stats.isDirectory()) {
        state.status = 503;
        state.message = "Filesystem in unexpected state";
      }

      callback(state);
      resolve();
    });
  });
}

async function combineTests(tests, callback) {
  const response = defaultResponse();

  for (const test of tests) {
    await test(componentState => {
      if (componentState.status !== 200) {
        response.status = 503;
      }

      response.components.push(componentState);
    });
  }

  callback(response);
}

function healthcheck() {
  const tests = [fsHealthy];

  return function(_req, res, _next) {
    return new Promise(function(resolve, _reject) {
      try {
        combineTests(tests, function(response) {
          res.status(response.status).json(response);
          resolve();
        });
      } catch (err) {
        res.status(503).json(err);
        resolve();
      }
    });
  };
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

module.exports = healthcheck;
