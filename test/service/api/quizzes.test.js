"use strict";

const assert = require("assert");
const sinon = require("sinon");
const quizzes = require("../../../app/api/quizzes");

describe("Quizzes API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "course", contextId: 123, per_page: 50 };
        path = quizzes.canvasPath({ query });
      });

      it("builds course paths", () => {
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("courses/123"));
      });

      it("asks for quizzes", () => {
        assert.ok(path.match("quizzes"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
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
    const canvasResponse = {
      statusCode: 200,
      body: [{ html_url: "/courses/1/quizzes/2", title: "Quiz 2" }]
    };

    let result;
    beforeEach(() => {
      sinon.spy(response, "send");
      quizzes.canvasResponseHandler(request, response, canvasResponse);
      result = response.send.firstCall.args[0];
      response.send.restore();
    });

    it("pulls href from canvas' html_url", () => {
      assert.equal(result.links[0].href, canvasResponse.body[0].html_url);
    });

    it("pulls title from canvas' title", () => {
      assert.equal(result.links[0].title, canvasResponse.body[0].title);
    });
  });
});
