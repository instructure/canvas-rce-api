"use strict";

const assert = require("assert");
const sinon = require("sinon");
const {
  canvasPath,
  transformBody,
  canvasResponseHandler
} = require("../../../app/api/mediaTracks");

describe("MediaTracks API", () => {
  describe("canvasPath()", () => {
    describe("GET", () => {
      it("builds the correct path for media_objects", () => {
        const params = { mediaObjectId: "m-theidgoeshere" };
        const query = {};
        const path = canvasPath({ params, query, method: "GET" });
        assert.equal(
          path,
          "/api/v1/media_objects/m-theidgoeshere/media_tracks"
        );
      });

      it("builds the correct path for media_attachments", () => {
        const params = { mediaAttachmentId: "attach-id" };
        const query = {};
        const path = canvasPath({ params, query, method: "GET" });
        assert.equal(path, "/api/v1/media_attachments/attach-id/media_tracks");
      });

      it("builds the correct path with 'include' query param", () => {
        const params = { mediaObjectId: "m-theidgoeshere" };
        const query = { include: "content,user_id" };
        const path = canvasPath({ params, query, method: "GET" });
        assert.equal(
          path,
          "/api/v1/media_objects/m-theidgoeshere/media_tracks?include[]=content&include[]=user_id"
        );
      });
    });

    describe("PUT", () => {
      it("builds the correct path for media_objects", () => {
        const params = { mediaObjectId: "m-theidgoeshere" };
        const query = {};
        const path = canvasPath({ params, query, method: "PUT" });
        assert.equal(
          path,
          "/api/v1/media_objects/m-theidgoeshere/media_tracks"
        );
      });

      it("builds the correct path for media_attachments", () => {
        const params = { mediaAttachmentId: "attach-id" };
        const query = {};
        const path = canvasPath({ params, query, method: "PUT" });
        assert.equal(path, "/api/v1/media_attachments/attach-id/media_tracks");
      });

      it("builds the correct path with 'include' query param", () => {
        const params = { mediaObjectId: "m-theidgoeshere" };
        const query = { include: "content,user_id" };
        const path = canvasPath({ params, query, method: "PUT" });
        assert.equal(
          path,
          "/api/v1/media_objects/m-theidgoeshere/media_tracks?include[]=content&include[]=user_id"
        );
      });

      it("builds the correct path with the array form of the 'include' query param", () => {
        const params = { mediaObjectId: "m-theidgoeshere" };
        const query = { include: ["content", "user_id"] };
        const path = canvasPath({ params, query, method: "PUT" });
        assert.equal(
          path,
          "/api/v1/media_objects/m-theidgoeshere/media_tracks?include[]=content&include[]=user_id"
        );
      });
    });

    describe("tansformBody()", () => {
      it("returns JSON string version of input", () => {
        const body = [
          {
            locale: "es",
            content: "1]\\n00:00:00,000 --> 00:00:01,251\nI'm spanish"
          },
          { locale: "en" }
        ];
        const result = transformBody(body);
        assert.equal(JSON.stringify(body), result);
      });

      it("copes with an empty array if tracks", () => {
        const body = [];
        const result = transformBody(body);
        assert.equal(JSON.stringify(body), result);
      });

      it("rejects a track that's missing 'locale'", () => {
        try {
          transformBody([
            { content: "1]\\n00:00:00,000 --> 00:00:01,251\nI'm english" }
          ]);
        } catch (e) {
          assert.equal(e.status, 400);
          assert.equal(e.message, JSON.stringify({ error: "locale required" }));
        }
      });

      it("rejects a body that's not an array", () => {
        try {
          transformBody({
            locale: "en",
            content: "1]\\n00:00:00,000 --> 00:00:01,251\nI'm english"
          });
        } catch (e) {
          assert.equal(e.status, 400);
          assert.equal(
            e.message,
            JSON.stringify({ error: "expected an array of tracks" })
          );
        }
      });
    });

    describe("canvasResponseHandler()", () => {
      let request, response, canvasResponse;

      beforeEach(() => {
        request = {
          protocol: "http",
          put: () => "canvashost"
        };
        response = {
          status: sinon.spy(),
          send: sinon.spy()
        };
        canvasResponse = {
          statusCode: 200,
          body: JSON.stringify('[{id: 1, locale: "en"}]')
        };
      });

      it("sends status from canvasResponse", () => {
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWith(response.status, canvasResponse.statusCode);
      });

      it("sends body from canvasResponse", () => {
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWith(response.send, canvasResponse.body);
      });
    });
  });
});
