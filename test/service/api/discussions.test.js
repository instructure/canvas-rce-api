"use strict";

const assert = require("assert");
const sinon = require("sinon");
const discussions = require("../../../app/api/discussions");

describe("Discussions API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let query;
      beforeEach(() => {
        query = { contextType: "course", contextId: 123, per_page: 50 };
      });

      it("builds course paths", () => {
        const path = discussions.canvasPath({ query });
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        const path = discussions.canvasPath({ query });
        assert.ok(path.match("courses/123"));
      });

      it("asks for discussions", () => {
        const path = discussions.canvasPath({ query });
        assert.ok(path.match("discussion_topics"));
      });

      it("passes per_page through", () => {
        const path = discussions.canvasPath({ query });
        assert.ok(path.match("per_page=50"));
      });

      it("includes search term", () => {
        query.search_term = "hello";
        const path = discussions.canvasPath({ query });
        assert.ok(path.match("&search_term=hello"));
      });
    });

    describe("group context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "group", contextId: 456 };
        path = discussions.canvasPath({ query });
      });

      it("builds group paths", () => {
        assert.ok(path.match("api/v1/groups"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("groups/456"));
      });
    });

    it("throws on user context", () => {
      const query = { contextType: "user", contextId: "self" };
      assert.throws(() => discussions.canvasPath({ query }));
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
            html_url: "/courses/1/discussions/2",
            title: "Discussion 2",
            published: true,
            ...overrides
          }
        ]
      };
      sinon.spy(response, "send");
      discussions.canvasResponseHandler(request, response, canvasResponse);
      const result = response.send.firstCall.args[0];
      response.send.restore();
      return [result, canvasResponse];
    }

    it("pulls href from canvas' html_url", () => {
      const [result, canvasResponse] = setup();
      assert.equal(result.links[0].href, canvasResponse.body[0].html_url);
    });

    it("pulls title from canvas' title", () => {
      const [result, canvasResponse] = setup();
      assert.equal(result.links[0].title, canvasResponse.body[0].title);
    });

    it("pulls the published state from canvas' response", () => {
      const [result, canvasResponse] = setup();
      assert.equal(result.links[0].published, canvasResponse.body[0].published);
    });

    it("pulls the due_at date from canvas' response", () => {
      const [result, canvasResponse] = setup(200, {
        assignment: { due_at: "2019-04-22T13:00:00Z" }
      });
      assert.equal(
        result.links[0].date,
        canvasResponse.body[0].assignment.due_at
      );
      assert.equal(result.links[0].date_type, "due");
    });

    it("pulls the todo date from canvas' response", () => {
      const [result, canvasResponse] = setup(200, {
        todo_date: "2019-04-22T13:00:00Z"
      });
      assert.equal(result.links[0].date, canvasResponse.body[0].todo_date);
      assert.equal(result.links[0].date_type, "todo");
    });
  });
});
