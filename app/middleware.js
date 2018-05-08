"use strict";

const addRequestId = require("express-request-id")();
const healthcheck = require("./middleware/healthcheck");
const requestLogging = require("./middleware/requestLogs");
const bodyParser = require("body-parser");
const statsLogging = require("./middleware/statsLogging");
const corsProtection = require("./middleware/corsProtection");
const errorHandling = require("./middleware/errors");

function middleware(app, applyRoutes) {
  // MUST be added before request logging,
  // as request logging depends on the id
  app.use(addRequestId);
  app.use("/healthcheck", healthcheck());
  app.use(bodyParser.json());
  requestLogging.applyToApp(app);
  statsLogging.applyToApp(app);
  corsProtection.applyToApp(app);

  applyRoutes(app);

  // error handling needs to be applied last
  errorHandling.applyToApp(app, process.env.SENTRY_DSN);
}

module.exports = middleware;
