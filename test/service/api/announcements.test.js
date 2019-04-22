"use strict";

const assert = require("assert");
const sinon = require("sinon");
const announcements = require("../../../app/api/announcements");

describe("Announcements API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "course", contextId: 123, per_page: 50 };
        path = announcements.canvasPath({ query });
      });

      it("builds course paths", () => {
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        assert.ok(path.match("courses/123"));
      });

      it("asks for discussions (announcements are discussions)", () => {
        assert.ok(path.match("discussion_topics"));
      });

      it("restricts to announcements", () => {
        assert.ok(path.match("only_announcements=1"));
      });

      it("passes per_page through", () => {
        assert.ok(path.match("per_page=50"));
      });
    });

    describe("group context", () => {
      let path;
      beforeEach(() => {
        const query = { contextType: "group", contextId: 456, per_page: 50 };
        path = announcements.canvasPath({ query });
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
    });

    it("throws on user context", () => {
      const query = { contextType: "user", contextId: "self" };
      assert.throws(() => announcements.canvasPath({ query }));
    });
  });

  describe("canvasResponseHandler", () => {
    const request = {};
    const response = { status: () => {}, send: () => {} };
    const canvasResponse = {
      statusCode: 200,
      body: [
        {
          html_url: "/courses/1/announcements/2",
          title: "Announcement 2",
          published: true
        }
      ]
    };

    let result;
    beforeEach(() => {
      sinon.spy(response, "send");
      announcements.canvasResponseHandler(request, response, canvasResponse);
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
