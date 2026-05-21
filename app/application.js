import express from "express";

import _env from "./env.js";
import { StatsMiddleware as _stats } from "./middleware/stats.js";
import { middleware as withMiddleware } from "./middleware.js";
import _routes from "./routes.js";

function inject(provide) {
  return [_env, _routes, provide(console), provide(express()), _stats];
}

function init(env, routes, logger, app, stats) {
  app.use(stats.handle);

  // Increase max default body size from 100kb to 300kb
  app.use(express.json({ limit: 300000 }));

  withMiddleware(app, (wrappedApp) => routes(wrappedApp));
  const port = env.get("PORT", () => 3000);
  return {
    listen() {
      const server = app.listen(port);
      logger.log(`Rich Content Service listening on port ${port}`);
      return server;
    },
  };
}

export default { inject, init, singleton: true };
