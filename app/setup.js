"use strict";

const withMiddleware = require("./middleware");
const appRoutes = require("./routes");

function setup(app) {
  withMiddleware(app, wrappedApp => {
    appRoutes(wrappedApp);
  });
}

module.exports = setup;
