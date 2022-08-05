"use strict";

const assert = require("assert");
const sinon = require("sinon");
const {
  canvasPath,
  canvasResponseHandler
} = require("../../../app/api/mediaObjects");

describe("MediaObjects API", () => {
  describe("canvasPath()", () => {
    describe("GET", () => {
      it("builds the correct path including a course context", () => {
        const params = {};
        const query = {
          contextId: 47,
          contextType: "course",
          per_page: 50
        };
        const path = canvasPath({ params, query, method: "GET" });
        assert.strictEqual(
          path,
          "/api/v1/courses/47/media_objects?per_page=50&use_verifiers=0&exclude[]=sources&exclude[]=tracks"
        );
      });

      it("builds the correct path including a group context", () => {
        const params = {};
        const query = {
          contextId: 47,
          contextType: "group",
          per_page: 50
        };
        const path = canvasPath({ params, query, method: "GET" });
        assert.strictEqual(
          path,
          "/api/v1/groups/47/media_objects?per_page=50&use_verifiers=0&exclude[]=sources&exclude[]=tracks"
        );
      });

      it("builds the correct path including a user context", () => {
        const params = {};
        const query = {
          contextId: 47,
          contextType: "user",
          per_page: 50
        };
        const path = canvasPath({ params, query, method: "GET" });
        assert.strictEqual(
          path,
          "/api/v1/media_objects?per_page=50&use_verifiers=0&exclude[]=sources&exclude[]=tracks"
        );
      });

      it("builds the correct path including sort order", () => {
        const params = {};
        const query = {
          contextId: 47,
          contextType: "user",
          per_page: 50,
          sort: "date",
          order: "desc"
        };
        const path = canvasPath({ params, query, method: "GET" });
        assert.strictEqual(
          path,
          "/api/v1/media_objects?per_page=50&use_verifiers=0&exclude[]=sources&exclude[]=tracks&sort=created_at&order=desc"
        );
      });

      it("handles user (no) contexts", () => {
        const params = {};
        const query = { per_page: 50 };
        const path = canvasPath({ params, query, method: "GET" });
        assert.strictEqual(
          path,
          "/api/v1/media_objects?per_page=50&use_verifiers=0&exclude[]=sources&exclude[]=tracks"
        );
      });

      describe("errors", () => {
        it("rejects a request with an invalid contextType", () => {
          const params = {};
          const query = {
            contextId: 47,
            contextType: "foobar",
            per_page: 50
          };
          assert.throws(() => canvasPath({ params, query, method: "GET" }));
        });

        it("rejects a request with a missing contextId", () => {
          const params = {};
          const query = {
            contextType: "foobar",
            per_page: 50
          };
          assert.throws(() => canvasPath({ params, query, method: "GET" }));
        });

        it("rejects a request with an invlid sort field", () => {
          const params = {};
          const query = {
            per_page: 50,
            sort: "foobar"
          };
          assert.throws(() => canvasPath({ params, query, method: "GET" }));
        });

        it("rejects a request with an invlid sort order", () => {
          const params = {};
          const query = {
            per_page: 50,
            sort: "title",
            order: "foobar"
          };
          assert.throws(() => canvasPath({ params, query, method: "GET" }));
        });
      });
    });

    describe("PUT", () => {
      it("builds the correct path", () => {
        const params = { mediaObjectId: "mo_id" };
        const query = { anyOtherJunk: 17, user_entered_title: "the new title" };
        const path = canvasPath({ params, query, method: "PUT" });
        assert.strictEqual(
          path,
          `/api/v1/media_objects/mo_id?user_entered_title=${encodeURIComponent(
            "the new title"
          )}`
        );
      });
    });

    describe("POST", () => {
      it("builds the correct path", () => {
        const path = canvasPath({ method: "POST" });
        assert.strictEqual(path, "/api/v1/media_objects");
      });
    });
  });

  describe("canvasResponseHandler()", () => {
    let request, response, canvasResponse;

    beforeEach(() => {
      request = {
        protocol: "http",
        get: () => "canvashost"
      };
      response = {
        status: sinon.spy(),
        send: sinon.spy()
      };
      canvasResponse = {
        statusCode: 200,
        body: []
      };
    });

    it("sends status from canvasResponse", () => {
      canvasResponseHandler(request, response, canvasResponse);
      sinon.assert.calledWith(response.status, canvasResponse.statusCode);
    });

    it("sends body from canvasResponse for non-200 responses", () => {
      canvasResponse.statusCode = 400;
      canvasResponseHandler(request, response, canvasResponse);
      sinon.assert.calledWith(response.send, canvasResponse.body);
    });

    describe("transformed response body", () => {
      beforeEach(() => {
        canvasResponse.body = [
          {
            title: "The Title",
            media_id: "m-gibberish",
            can_add_captions: true,
            media_type: "video",
            created_at: "2019-04-01T13:00Z",
            embedded_iframe_url: "http://somewhere"
          },
          {
            user_entered_title: "Second User Title",
            title: "Second Title",
            media_id: "m-gibberish2",
            can_add_captions: true,
            media_type: "video",
            created_at: "2019-04-01T13:01Z",
            embedded_iframe_url: "http://somewhere_else"
          }
        ];
      });

      it("transforms the API response", () => {
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return (
            val.bookmark === null &&
            val.files[0].id === "m-gibberish" &&
            val.files[0].title === "The Title" &&
            val.files[0].content_type === "video" &&
            val.files[0].date === "2019-04-01T13:00Z" &&
            val.files[0].published === true &&
            val.files[0].embedded_iframe_url === "http://somewhere"
          );
        });
      });

      it("prefers user's title in the API response", () => {
        canvasResponse.body[0].user_entered_title = "User Title";
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return val.files[0].title === "User Title";
        });
      });

      it("transforms the whole files array", () => {
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return (
            val.bookmark === null &&
            val.files[0].id === "m-gibberish" &&
            val.files[0].title === "The Title" &&
            val.files[0].content_type === "video" &&
            val.files[0].date === "2019-04-01T13:00Z" &&
            val.files[0].published === true &&
            val.files[0].embedded_iframe_url === "http://somewhere" &&
            val.files[1].id === "m-gibberish2" &&
            val.files[1].title === "Second User Title" &&
            val.files[1].content_type === "video" &&
            val.files[1].date === "2019-04-01T13:01Z" &&
            val.files[1].published === true &&
            val.files[1].embedded_iframe_url === "http://somewhere_else"
          );
        });
      });
    });
  });
});
