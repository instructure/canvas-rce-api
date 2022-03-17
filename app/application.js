"use strict";

const express = require("express");
const _stats = require("./middleware/stats");
const withMiddleware = require("./middleware");
const _env = require("./env");
const _routes = require("./routes");

function inject(provide) {
  return [_env, _routes, provide(console), provide(express()), _stats];
}

function init(env, routes, logger, app, stats) {
  app.use(stats.handle);

  // Increase max default body size from 100kb to 300kb
  app.use(express.json({ limit: 300000 }))

  withMiddleware(app, wrappedApp => routes(wrappedApp));
  const port = env.get("PORT", () => 3000);
  return {
    listen() {
      const server = app.listen(port);
      logger.log(`Rich Content Service listening on port ${port}`);
      return server;
    }
  };
}

module.exports = { inject, init, singleton: true };
