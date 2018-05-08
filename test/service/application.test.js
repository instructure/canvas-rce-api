"use strict";

const _application = require("../../app/application");
const _routes = require("../../app/routes");
const express = require("express");
const request = require("supertest");

describe("App Setup", () => {
  let env, routes, logger, app;

  beforeEach(() => {
    app = express();
    env = { get: n => n === "PORT" && 4700 };
    routes = _routes.init({ applyToApp: () => {} }, () => {});
    logger = { log: () => {} };
    _application.init(env, routes, logger, app);
  });

  it("handles errors", done => {
    request(app)
      .get("/test_error")
      .expect(500)
      .expect(/From Simple Error Handler/)
      .end(done);
  });

  it("can render a hello page", done => {
    request(app)
      .get("/")
      .expect(200)
      .expect(/Hello, from RCE Service/)
      .end(done);
  });
});
