"use strict";

const assert = require("assert");
const sinon = require("sinon");
const quizzes = require("../../../app/api/quizzes");

describe("Quizzes API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let query;
      beforeEach(() => {
        query = { contextType: "course", contextId: 123, per_page: 50 };
      });

      it("builds course paths", () => {
        const path = quizzes.canvasPath({ query });
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        const path = quizzes.canvasPath({ query });
        assert.ok(path.match("courses/123"));
      });

      it("asks for quizzes", () => {
        const path = quizzes.canvasPath({ query });
        assert.ok(path.match("quizzes"));
      });

      it("passes per_page through", () => {
        const path = quizzes.canvasPath({ query });
        assert.ok(path.match("per_page=50"));
      });

      it("includes search term", () => {
        query.search_term = "hello";
        const path = quizzes.canvasPath({ query });
        assert.ok(path.match("&search_term=hello"));
      });
    });

    it("throws on group context", () => {
      const query = { contextType: "group", contextId: "456", per_page: 50 };
      assert.throws(() => quizzes.canvasPath({ query }));
    });

    it("throws on user context", () => {
      const query = { contextType: "user", contextId: "self", per_page: 50 };
      assert.throws(() => quizzes.canvasPath({ query }));
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
            html_url: "/courses/1/quizzes/2",
            title: "Quiz 2",
            published: true,
            all_dates: [{ due_at: "2019-04-22T13:00:00Z" }],
            due_at: "2019-04-22T13:00:00Z",
            quiz_type: "assignment",
            ...overrides
          }
        ]
      };

      sinon.spy(response, "send");
      quizzes.canvasResponseHandler(request, response, canvasResponse);
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

    it("pulls the due date from canvas' response", () => {
      const [result, canvasResponse] = setup();
      assert.equal(result.links[0].date, canvasResponse.body[0].due_at);
      assert.equal(result.links[0].date_type, "due");
    });

    it("handles multiple due dates in canvas's response", () => {
      const [result] = setup(200, {
        all_dates: [
          { due_at: "2019-04-22T13:00:00Z" },
          { due_at: "2019-04-23T13:00:00Z" }
        ],
        due_at: null
      });
      assert.equal(result.links[0].date, "multiple");
      assert.equal(result.links[0].date_type, "due");
    });

    it("pulls the quiz_type from canvas' response", () => {
      const [result, canvasResponse] = setup();
      assert.equal(result.links[0].quiz_type, canvasResponse.body[0].quiz_type);
    });
  });
});
