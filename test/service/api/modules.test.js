"use strict";

const assert = require("assert");
const sinon = require("sinon");
const modules = require("../../../app/api/modules");

describe("Modules API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "course", contextId: 123, per_page: 50 };
        path = modules.canvasPath({ query });
      });

      it("builds course paths", () => {
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("courses/123"));
      });

      it("asks for modules", () => {
        assert.ok(path.match("modules"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
      });
    });

    it("throws on group context", () => {
      const query = { contextType: "group", contextId: "456", per_page: 50 };
      assert.throws(() => modules.canvasPath({ query }));
    });

    it("throws on user context", () => {
      const query = { contextType: "user", contextId: "self", per_page: 50 };
      assert.throws(() => modules.canvasPath({ query }));
    });
  });

  describe("canvasResponseHandler", () => {
    const request = { query: { contextId: 123 } };
    const response = { status: () => {}, send: () => {} };
    const canvasResponse = {
      statusCode: 200,
      body: [{ id: "456", name: "Module 2", published: true }]
    };

    let result;
    beforeEach(() => {
      sinon.spy(response, "send");
      modules.canvasResponseHandler(request, response, canvasResponse);
      result = response.send.firstCall.args[0];
      response.send.restore();
    });

    it("constructs href using request's contextId", () => {
      assert.ok(result.links[0].href.match(request.query.contextId));
    });

    it("constructs href using canvas' id", () => {
      assert.ok(result.links[0].href.match(canvasResponse.body[0].id));
    });

    it("pulls title from canvas' name", () => {
      assert.equal(result.links[0].title, canvasResponse.body[0].name);
    });

    it("pulls the published state from canvas' response", () => {
      assert.equal(result.links[0].published, canvasResponse.body[0].published);
    });
  });
});
