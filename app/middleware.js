"use strict";

const addRequestId = require("express-request-id")();
const healthcheck = require("./middleware/healthcheck");
const requestLogging = require("./middleware/requestLogs");
const express = require("express");
const corsProtection = require("./middleware/corsProtection");
const errorHandling = require("./middleware/errors");
const stats = require("./middleware/stats");
const statsdKey = stats.actionKeyMiddleware;

function middleware(app, applyRoutes) {
  // MUST be added before request logging,
  // as request logging depends on the id
  app.use(addRequestId);
  app.use("/readiness", statsdKey("main", "readiness"), healthcheck());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  requestLogging.applyToApp(app);
  corsProtection.applyToApp(app);

  applyRoutes(app);

  // error handling needs to be applied last
  errorHandling.applyToApp(app, process.env.SENTRY_DSN);
}

module.exports = middleware;
