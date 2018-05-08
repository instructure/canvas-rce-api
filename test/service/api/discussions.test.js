"use strict";

const assert = require("assert");
const sinon = require("sinon");
const discussions = require("../../../app/api/discussions");

describe("Discussions API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "course", contextId: 123, per_page: 50 };
        path = discussions.canvasPath({ query });
      });

      it("builds course paths", () => {
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("courses/123"));
      });

      it("asks for discussions", () => {
        assert.ok(path.match("discussion_topics"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
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
    const canvasResponse = {
      status: 200,
      body: [{ html_url: "/courses/1/discussions/2", title: "Discussion 2" }]
    };

    let result;
    beforeEach(() => {
      sinon.spy(response, "send");
      discussions.canvasResponseHandler(request, response, canvasResponse);
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
