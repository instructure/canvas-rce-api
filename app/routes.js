"use strict";

const stats = require("./middleware/stats");
const statsdKey = stats.actionKeyMiddleware;
const _api = require("./api");
const _auth = require("./middleware/auth");

function inject() {
  return [_api, _auth];
}

function init(api, auth) {
  return app => {
    app.get("/", statsdKey("main", "home"), function(request, response) {
      response.send("Hello, from RCE Service");
    });

    api.applyToApp(app);

    app.get("/test_error", statsdKey("main", "test_error"), function() {
      throw new Error("Busted!");
    });

    app.get("/test_jwt", statsdKey("main", "test_jwt"), auth, function(
      request,
      response
    ) {
      response.status(200).end();
    });
  };
}

module.exports = { inject, init, singleton: true };
