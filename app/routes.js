import _api from "./api/index.js";
import _auth from "./middleware/auth.js";
import { StatsMiddleware as stats } from "./middleware/stats.js";

const statsdKey = stats.actionKeyMiddleware;

function inject() {
  return [_api, _auth];
}

function init(api, auth) {
  return (app) => {
    app.get("/", statsdKey("main", "home"), function (request, response) {
      response.send("Hello, from RCE Service");
    });

    api.applyToApp(app);

    if (process.env.NODE_ENV === "development") {
      app.get("/test_error", statsdKey("main", "test_error"), function () {
        throw new Error("Busted!");
      });
    }

    app.get(
      "/test_jwt",
      statsdKey("main", "test_jwt"),
      auth,
      function (request, response) {
        response.status(200).end();
      },
    );
  };
}

export default { inject, init, singleton: true };
