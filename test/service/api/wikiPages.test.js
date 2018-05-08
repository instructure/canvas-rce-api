"use strict";

const assert = require("assert");
const sinon = require("sinon");
const wikiPages = require("../../../app/api/wikiPages");

describe("Wiki Pages API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "course", contextId: 123, per_page: 50 };
        path = wikiPages.canvasPath({ query });
      });

      it("builds course paths", () => {
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("courses/123"));
      });

      it("asks for wikiPages", () => {
        assert.ok(path.match("pages"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
      });

      it("sorts by title", () => {
        assert.ok(path.match("sort=title"));
      });
    });

    describe("group context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "group", contextId: 456, per_page: 50 };
        path = wikiPages.canvasPath({ query });
      });

      it("builds group paths", () => {
        assert.ok(path.match("api/v1/groups"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("groups/456"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
      });

      it("sorts by title", () => {
        assert.ok(path.match("sort=title"));
      });
    });

    it("throws on user context", () => {
      const query = { contextType: "user", contextId: "self", per_page: 50 };
      assert.throws(() => wikiPages.canvasPath({ query }));
    });
  });

  describe("canvasResponseHandler", () => {
    const request = {};
    const response = { status: () => {}, send: () => {} };
    const canvasResponse = {
      status: 200,
      body: [{ html_url: "/courses/1/pages/the-page", title: "The Wiki Page" }]
    };

    let result;
    beforeEach(() => {
      sinon.spy(response, "send");
      wikiPages.canvasResponseHandler(request, response, canvasResponse);
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
