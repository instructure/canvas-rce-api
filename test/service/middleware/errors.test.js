"use strict";

const errors = require("../../../app/middleware/errors");
const assert = require("assert");

describe("Error Handling", function() {
  describe("onRavenData", function() {
    it("adds environment to tags", function() {
      let data = { tags: { some: "data" } };
      errors.onRavenData(data, "testenv");
      assert.equal(data.tags.some, "data");
      assert.equal(data.tags.site, "testenv");
    });

    it("tags enviroment info when tags don't exist", function() {
      let data = {};
      errors.onRavenData(data, "testenv");
      assert.equal(data.tags.site, "testenv");
    });

    it("removes request env from data object (it's in the tags)", function() {
      let data = { request: { env: "production" } };
      errors.onRavenData(data, "testenv");
      assert.equal(data.request.env, undefined);
    });
  });

  describe("onMiddlewareData", function() {
    it("adds the request id to the extras hash", function() {
      let req = { id: "some-uuid" };
      let data = { extra: { some: "data" } };
      errors.onMiddlewareData(req, data);
      assert.equal(data.extra.some, "data");
      assert.equal(data.extra.request_id, "some-uuid");
    });

    it("builds the extra hash if it's not there", function() {
      let req = { id: "some-uuid" };
      let data = {};
      errors.onMiddlewareData(req, data);
      assert.equal(data.extra.request_id, "some-uuid");
    });
  });

  describe("applyToApp", function() {
    it("can hook middleware to the app without bombing", function() {
      let app = {
        middlewares: [],
        use: function(middleware) {
          this.middlewares.push(middleware);
        }
      };
      assert.doesNotThrow(function() {
        errors.applyToApp(app, "https://fake:dsn@sentry.local:9000/app/1");
      });
    });
  });
});
