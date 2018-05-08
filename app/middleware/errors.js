"use strict";

/*eslint no-console: 0*/
/*eslint no-unused-vars: 0*/

const raven = require("raven");

function ravenDataCallback(data, environment) {
  data.tags = data.tags || {};
  data.tags.site = environment;

  if (data.request && data.request.env) {
    delete data.request.env;
  }

  return data;
}

function middlewareErrorData(req, data) {
  data.extra = data.extra || {};
  data.extra.request_id = req.id;
  return data;
}

function buildRavenClient(dsn, environment) {
  var raven_client = new raven.Client(dsn, {
    dataCallback: function(data) {
      return ravenDataCallback(data, environment);
    }
  });
  raven_client.patchGlobal(function() {
    console.log("Exiting due to uncaught exception.");
    process.exit(1);
  });
  return raven_client;
}

function errorStatusCode(err) {
  return err.status || 500;
}

function applySentryMiddleware(app, client) {
  app.use(raven.middleware.express(client, middlewareErrorData));

  app.use(function(err, req, res, next) {
    // still useful to have stack in console output for on-server debugging
    console.error(err.stack);
    res.status(errorStatusCode(err));
    res.send("From Sentry Error Handler");
    res.end("An error occurred.\n" + res.sentry + "\n");
  });
}

function simpleOnError(err, req, res, next) {
  res.status(errorStatusCode(err));
  res.send("From Simple Error Handler" + "\n" + err.toString());
  res.end(res.sentry + "\n");
}

function applySimpleErrorMiddleware(app) {
  app.use(simpleOnError);
}

function handledErrorMiddleware(err, req, res, next) {
  if (err.handle) {
    err.handle(req, res, next);
  } else {
    next(err);
  }
}

function applyToApp(app, sentryDSN) {
  // Set up error handling
  var ravenClient = null;
  if (sentryDSN) {
    var environment = process.env.INS_STACK_NAME || process.env.NODE_ENV;
    ravenClient = buildRavenClient(sentryDSN, environment);
  }

  app.use(handledErrorMiddleware);

  if (ravenClient) {
    applySentryMiddleware(app, ravenClient);
  } else {
    applySimpleErrorMiddleware(app);
  }
}

module.exports.applyToApp = applyToApp;
module.exports.onRavenData = ravenDataCallback;
module.exports.onMiddlewareData = middlewareErrorData;
