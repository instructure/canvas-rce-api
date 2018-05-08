"use strict";

const assert = require("assert");
const sinon = require("sinon");
const assignments = require("../../../app/api/assignments");

describe("Assignments API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "course", contextId: 123, per_page: 50 };
        path = assignments.canvasPath({ query });
      });

      it("builds course paths", () => {
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("courses/123"));
      });

      it("asks for assignments", () => {
        assert.ok(path.match("assignments"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
      });
    });

    it("throws on group context", () => {
      const query = { contextType: "group", contextId: "456" };
      assert.throws(() => assignments.canvasPath({ query }));
    });

    it("throws on user context", () => {
      const query = { contextType: "user", contextId: "self" };
      assert.throws(() => assignments.canvasPath({ query }));
    });
  });

  describe("canvasResponseHandler", () => {
    const request = {};
    const response = { status: () => {}, send: () => {} };
    const canvasResponse = {
      status: 200,
      body: [{ html_url: "/courses/1/assignments/2", name: "Assignment 2" }]
    };

    let result;
    beforeEach(() => {
      sinon.spy(response, "send");
      assignments.canvasResponseHandler(request, response, canvasResponse);
      result = response.send.firstCall.args[0];
      response.send.restore();
    });

    it("pulls href from canvas' html_url", () => {
      assert.equal(result.links[0].href, canvasResponse.body[0].html_url);
    });

    it("pulls title from canvas' name", () => {
      assert.equal(result.links[0].title, canvasResponse.body[0].name);
    });
  });
});
