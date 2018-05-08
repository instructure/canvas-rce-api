"use strict";

const expressStatsd = require("express-statsd");
const Lynx = require("lynx");

const statsdHost = process.env.STATSD_HOST;
const statsdPort = process.env.STATSD_PORT;
const statsdClient = new Lynx(statsdHost, statsdPort);
const cgEnvironment = process.env.CG_ENVIRONMENT || "development";
const keyPrefix = ["cg", "rich-content-service", cgEnvironment, "request"];

function statsdKeyMiddleware(controller, action) {
  let keyComponent = "";
  if (controller === undefined || action === undefined) {
    keyComponent = "path";
  } else {
    keyComponent = "" + controller + "." + action;
  }
  return (request, response, next) => {
    if (keyComponent == "path") {
      keyComponent = request.path
        .split("/")
        .join("-")
        .replace(/^-/, "");
    }
    var key = keyPrefix.concat(keyComponent).join(".");
    request.statsdKey = key;
    next();
  };
}

function applyToApp(app) {
  var options = { host: statsdHost, port: statsdPort };
  app.use(expressStatsd(options));
}

function recordTiming(keyParts, startTime, endTime, client = statsdClient) {
  const duration = endTime - startTime;
  const key = keyPrefix.concat(keyParts).join(".");
  client.timing(key, duration);
}

module.exports = { statsdKeyMiddleware, applyToApp, recordTiming };
