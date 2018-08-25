"use strict";

const assert = require("assert");
const sinon = require("sinon");
const linksResponseHandler = require("../../../app/api/linksResponseHandler");

describe("Link API response handlers", () => {
  const request = {};
  const response = { status: () => {}, send: () => {} };
  const staticTransformResult = "Static transform result";
  const staticTransform = () => {
    return staticTransformResult;
  };

  describe("non-200 canvas responses", () => {
    const failedCanvasResponse = {
      statusCode: 404,
      body: { error: "Resource does not exist" }
    };

    let handler;
    beforeEach(() => {
      handler = linksResponseHandler(staticTransform);
    });

    it("just forwards status", () => {
      sinon.spy(response, "status");
      handler(request, response, failedCanvasResponse);
      assert.ok(response.status.calledWith(failedCanvasResponse.statusCode));
      response.status.restore();
    });

    it("just forwards body", () => {
      sinon.spy(response, "send");
      handler(request, response, failedCanvasResponse);
      assert.ok(response.send.calledWith(failedCanvasResponse.body));
      response.send.restore();
    });
  });

  describe("successful canvas responses", () => {
    const canvasResponse = {
      statusCode: 200,
      body: [
        { html_url: "/courses/1/announcements/2", title: "Announcement 2" }
      ]
    };

    let handler;
    beforeEach(() => {
      handler = linksResponseHandler(staticTransform);
    });

    it("has a status of 200", () => {
      sinon.spy(response, "status");
      handler(request, response, canvasResponse);
      assert.ok(response.status.calledWith(200));
      response.status.restore();
    });

    it("puts the result of the transform in the links key", () => {
      sinon.spy(response, "send");
      handler(request, response, canvasResponse);
      const sentBody = response.send.firstCall.args[0];
      assert.deepEqual(sentBody.links, staticTransformResult);
      response.send.restore();
    });

    it("leaves the bookmark null if the canvas response didn't have one", () => {
      sinon.spy(response, "send");
      handler(request, response, canvasResponse);
      const sentBody = response.send.firstCall.args[0];
      assert.equal(sentBody.bookmark, undefined);
      response.send.restore();
    });

    describe("bookmark construction", () => {
      const canvasBookmark = "/canvasBookmark";
      const bookmarkedCanvasResponse = Object.assign({}, canvasResponse, {
        bookmark: canvasBookmark
      });
      const request = {
        protocol: "http",
        get: header => header === "Host" && "rce.example",
        baseUrl: "/api",
        path: "/wikiPages",
        query: {
          contextType: "course",
          contextId: "123",
          bookmark: "/oldBookmark"
        }
      };

      let bookmark;
      beforeEach(() => {
        sinon.spy(response, "send");
        handler(request, response, bookmarkedCanvasResponse);
        bookmark = response.send.firstCall.args[0].bookmark;
        response.send.restore();
      });

      it("keeps the request's protocol and host", () => {
        assert.ok(bookmark.match("^http://rce.example"));
      });

      it("keeps the request's endpoint", () => {
        assert.ok(bookmark.match("/api/wikiPages"));
      });

      it("keeps the request's query parameters", () => {
        assert.ok(bookmark.match("contextType=course"));
        assert.ok(bookmark.match("contextId=123"));
      });

      it("doesn't keep the request's old bookmark", () => {
        assert.ok(!bookmark.match(encodeURIComponent(request.query.bookmark)));
      });

      it("adds the canvas bookmark", () => {
        assert.ok(
          bookmark.match(`bookmark=${encodeURIComponent(canvasBookmark)}`)
        );
      });
    });
  });
});
