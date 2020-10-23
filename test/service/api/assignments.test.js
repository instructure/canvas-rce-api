"use strict";

const assert = require("assert");
const sinon = require("sinon");
const assignments = require("../../../app/api/assignments");

describe("Assignments API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let query;
      beforeEach(() => {
        query = { contextType: "course", contextId: 123, per_page: 50 };
      });

      it("builds course paths", () => {
        const path = assignments.canvasPath({ query });
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        const path = assignments.canvasPath({ query });
        assert.ok(path.match("courses/123"));
      });

      it("asks for assignments", () => {
        const path = assignments.canvasPath({ query });
        assert.ok(path.match("assignments"));
      });

      it("passes per_page through", () => {
        const path = assignments.canvasPath({ query });
        assert.ok(path.match("per_page=50"));
      });

      it("includes search term", () => {
        query.search_term = "hello";
        const path = assignments.canvasPath({ query });
        assert.ok(path.match("&search_term=hello"));
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

    function setup(statusCode = 200, overrides = {}) {
      const canvasResponse = {
        statusCode: statusCode,
        body: [
          {
            html_url: "/courses/1/assignments/2",
            name: "Assignment 2",
            due_date: "2019-04-22T13:00:00Z",
            date_type: "due",
            published: true,
            ...overrides
          }
        ]
      };
      sinon.spy(response, "send");
      assignments.canvasResponseHandler(request, response, canvasResponse);
      const result = response.send.firstCall.args[0];
      response.send.restore();
      return [result, canvasResponse];
    }

    it("pulls href from canvas' html_url", () => {
      const [result, canvasResponse] = setup();
      assert.strictEqual(result.links[0].href, canvasResponse.body[0].html_url);
    });

    it("pulls title from canvas' name", () => {
      const [result, canvasResponse] = setup();
      assert.strictEqual(result.links[0].title, canvasResponse.body[0].name);
    });

    it("pulls the published state from canvas' response", () => {
      const [result, canvasResponse] = setup();
      assert.strictEqual(
        result.links[0].published,
        canvasResponse.body[0].published
      );
    });

    it("pulls date from canvas' due_at", () => {
      const [result, canvasResponse] = setup();
      assert.strictEqual(result.links[0].date, canvasResponse.body[0].due_at);
      assert.strictEqual(result.links[0].date_type, "due");
    });

    it("deals with multiple dates", () => {
      const [result] = setup(200, { has_overrides: true });
      assert.strictEqual(result.links[0].date, "multiple");
      assert.strictEqual(result.links[0].date_type, "due");
    });
  });
});
