"use strict";

const sinon = require("sinon");
const { deepStrictEqual, strictEqual } = require("assert");
const fs = require("fs");
const healthcheck = require("../../../app/middleware/healthcheck");

describe("Healthcheck middleware", () => {
  it("returns a function", async () => {
    const fn = healthcheck();
    strictEqual(typeof fn, "function");
  });

  describe("healthcheck returned function", () => {
    let fsStatStub, jsonStub, statusStub;
    let healthCheckFn;
    let res;

    beforeEach(() => {
      fsStatStub = sinon.stub(fs, "stat");
      healthCheckFn = healthcheck();
      jsonStub = sinon.stub();
      statusStub = sinon.stub().returns({ json: jsonStub });
      res = { status: statusStub };
    });

    afterEach(() => {
      fsStatStub.restore();
    });

    it("returns status 200 when components are healthy", async () => {
      fsStatStub.callsArgWith(1, null, { isDirectory: () => true });

      await healthCheckFn(null, res, null);
      strictEqual(statusStub.firstCall.args[0], 200);
    });

    it("returns json describing healthy components when healthy", async () => {
      const expectedComponent = {
        message: "Filesystem healthy",
        name: "Filesystem",
        status: 200
      };

      fsStatStub.callsArgWith(1, null, { isDirectory: () => true });

      await healthCheckFn(null, res, null);
      deepStrictEqual(
        jsonStub.firstCall.args[0].components[0],
        expectedComponent
      );
    });

    it("returns status 503 when components are unhealthy", async () => {
      fsStatStub.callsArgWith(1, null, { isDirectory: () => false });

      await healthCheckFn(null, res, null);
      strictEqual(statusStub.firstCall.args[0], 503);
    });

    it("returns json describing unhealthy components when unhealthy", async () => {
      const expectedComponent = {
        message: "Filesystem in unexpected state",
        name: "Filesystem",
        status: 503
      };

      fsStatStub.callsArgWith(1, null, { isDirectory: () => false });

      await healthCheckFn(null, res, null);
      deepStrictEqual(
        jsonStub.firstCall.args[0].components[0],
        expectedComponent
      );
    });
  });
});
