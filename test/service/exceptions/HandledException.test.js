"use strict";

const HandledException = require("../../../app/exceptions/HandledException");
const express = require("express");
const request = require("supertest");

describe("HandledException", () => {
  let app, err;

  beforeEach(() => {
    app = express();
    err = new HandledException("error message", 401);
    app.use(err.handle.bind(err));
  });

  it("returns error message and status code", done => {
    request(app)
      .get("/")
      .expect(401)
      .expect("error message")
      .end(done);
  });

  it("defauls to 500 status code", done => {
    delete err.status;
    request(app)
      .get("/")
      .expect(500)
      .end(done);
  });
});
