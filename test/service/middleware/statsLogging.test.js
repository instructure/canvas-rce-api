"use strict";

const stats = require("../../../app/middleware/statsLogging");
const assert = require("assert");
const sinon = require("sinon");

describe("Stats Logging", function() {
  describe("statsdKeyMiddleware", function() {
    it("adds a statsdKey to each request", function(done) {
      let req = {
        method: "GET",
        path: "/my/api/call"
      };
      let resp = {};
      let middleware = stats.statsdKeyMiddleware("controller", "action");
      middleware(req, resp, function() {
        let key =
          "cg.rich-content-service.development.request.controller.action";
        assert.equal(req.statsdKey, key);
        done();
      });
    });

    it("uses path if key elements not present", function(done) {
      let req = {
        path: "/my/api/call"
      };
      let resp = {};
      let middleware = stats.statsdKeyMiddleware();
      middleware(req, resp, function() {
        let key = "cg.rich-content-service.development.request.my-api-call";
        assert.equal(req.statsdKey, key);
        done();
      });
    });
  });

  describe("applyToApp", function() {
    it("generates a statsd client without blowing up", function() {
      let app = {
        middlewares: [],
        use: function(middleware) {
          this.middlewares.push(middleware);
        }
      };
      assert.doesNotThrow(function() {
        stats.applyToApp(app);
      });
    });
  });

  describe("recordTiming", () => {
    it("allows recording an arbitrary duration any time", () => {
      let client = { timing: sinon.stub() };
      let startTime = new Date().getTime();
      let endTime = startTime + 246;
      stats.recordTiming(["my", "key"], startTime, endTime, client);
      let expectedKey = "cg.rich-content-service.development.request.my.key";
      assert.ok(client.timing.calledWith(expectedKey, 246));
    });
  });
});
