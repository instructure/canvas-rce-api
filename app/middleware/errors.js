/*eslint no-console: 0*/
/*eslint no-unused-vars: 0*/

import * as Sentry from "@sentry/node";

function onBeforeSend(event, environment) {
  event.tags = event.tags || {};
  event.tags.site = environment;

  if (event.request && event.request.env) {
    delete event.request.env;
  }

  return event;
}

function errorStatusCode(err) {
  return err.status || 500;
}

function attachRequestId(err, req, _res, next) {
  Sentry.getCurrentScope().setExtra("request_id", req.id);
  next(err);
}

function handledErrorMiddleware(err, req, res, next) {
  if (err.handle) {
    err.handle(req, res, next);
  } else {
    next(err);
  }
}

function finalErrorRenderer() {
  return function (err, req, res, _next) {
    // still useful to have stack in console output for on-server debugging
    console.error(err.stack);
    const errorId = res.sentry || req.id;
    res.status(errorStatusCode(err));
    res.type("text/plain").send(`An error occurred. Error ID: ${errorId}\n`);
  };
}

function applyToApp(app) {
  // Sentry.init is performed early in instrument.js
  const sentryActive = Boolean(Sentry.getClient());

  if (sentryActive) {
    app.use(attachRequestId);
  }

  app.use(handledErrorMiddleware);

  if (sentryActive) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use(finalErrorRenderer());
}

export { applyToApp, onBeforeSend };
