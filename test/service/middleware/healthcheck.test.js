"use strict";

const sinon = require("sinon");
const { equal } = require("assert");
const fs = require("fs");
const tests = require("../../../app/middleware/healthcheck");

describe("Healthcheck middleware", () => {
  describe("fsHealthy", () => {
    let cb;

    beforeEach(() => {
      sinon.stub(fs, "stat");
      cb = sinon.spy();
      tests.fsHealthy(cb);
    });

    afterEach(() => {
      fs.stat.restore();
    });

    it("calls back with nothing if healthy", () => {
      fs.stat.firstCall.args[1](null, { isDirectory: () => true });
      sinon.assert.calledWithExactly(cb);
    });

    it("calls back with unhealthy if it can not find directory", () => {
      fs.stat.firstCall.args[1](null, { isDirectory: () => false });
      sinon.assert.calledWithMatch(cb, { state: "unhealthy" });
    });

    it("calls back with unhealthy if there is a fs error", () => {
      fs.stat.firstCall.args[1](new Error("fs error"));
      sinon.assert.calledWithMatch(cb, { state: "unhealthy" });
    });
  });

  describe("combineTests", () => {
    it("should not mutate the array of test functions", () => {
      const checks = [() => {}];
      tests.combineTests(checks, () => {});
      equal(checks.length, 1);
    });
  });
});
