import express from "express";

import * as corsProtection from "./middleware/corsProtection.js";
import * as errorHandling from "./middleware/errors.js";
import { healthcheck } from "./middleware/healthcheck.js";
import { addRequestId } from "./middleware/requestId.js";
import * as requestLogging from "./middleware/requestLogs.js";
import { StatsMiddleware as stats } from "./middleware/stats.js";

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
  errorHandling.applyToApp(app);
}

export { middleware };
