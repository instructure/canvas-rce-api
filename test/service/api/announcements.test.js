"use strict";

const assert = require("assert");
const sinon = require("sinon");
const announcements = require("../../../app/api/announcements");

describe("Announcements API", () => {
  describe("canvasPath", () => {
    describe("course context", () => {
      let query;
      beforeEach(() => {
        query = { contextType: "course", contextId: 123, per_page: 50 };
      });

      it("builds course paths", () => {
        const path = announcements.canvasPath({ query });
        assert.ok(path.match("api/v1/courses"));
      });

      it("uses context id in path", () => {
        const path = announcements.canvasPath({ query });
        assert.ok(path.match("courses/123"));
      });

      it("asks for discussions (announcements are discussions)", () => {
        const path = announcements.canvasPath({ query });
        assert.ok(path.match("discussion_topics"));
      });

      it("restricts to announcements", () => {
        const path = announcements.canvasPath({ query });
        assert.ok(path.match("only_announcements=1"));
      });

      it("passes per_page through", () => {
        const path = announcements.canvasPath({ query });
        assert.ok(path.match("per_page=50"));
      });

      it("includes search term", () => {
        query.search_term = "hello";
        const path = announcements.canvasPath({ query });
        assert.ok(path.match("&search_term=hello"));
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

    function setup(statusCode = 200, overrides = {}) {
      const canvasResponse = {
        statusCode: statusCode,
        body: [
          {
            html_url: "/courses/1/announcements/2",
            title: "Announcement 2",
            posted_at: "2019-04-24T13:00:00Z",
            ...overrides
          }
        ]
      };
      sinon.spy(response, "send");
      announcements.canvasResponseHandler(request, response, canvasResponse);
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

    it("pulls posted_at from canvas' response", () => {
      const [result, canvasResponse] = setup();
      assert.equal(result.links[0].date, canvasResponse.body[0].posted_at);
      assert.equal(result.links[0].date_type, "posted");
    });

    it("pulls delayed_post_at from canvas' response if after posted_at", () => {
      const posted_at = "2019-04-25T13:00:00Z";
      const delayed_post_at = "2019-05-05T13:00:00Z";
      const [result, canvasResponse] = setup(200, {
        posted_at,
        delayed_post_at
      });
      assert.equal(
        result.links[0].date,
        canvasResponse.body[0].delayed_post_at
      );
      assert.equal(result.links[0].date_type, "delayed_post");
    });
  });
});
