"use strict";

const assert = require("assert");
const sinon = require("sinon");
const {
  canvasPath,
  canvasResponseHandler
} = require("../../../app/api/images");

describe("Images API", () => {
  describe("canvasPath()", () => {
    it("builds the correct path including context id", () => {
      const id = 47;
      const params = {};
      const query = { contextId: id, contextType: "course", per_page: 50 };
      assert(
        canvasPath({ params, query }) ===
          `/api/v1/courses/${id}/files?per_page=50&content_types[]=image&use_verifiers=0`
      );
    });

    it("handles group contexts", () => {
      const contextId = 47;
      const params = {};
      const query = { contextType: "group", contextId, per_page: 50 };
      const path = canvasPath({ params, query });
      assert(
        path ===
          `/api/v1/groups/${contextId}/files?per_page=50&content_types[]=image&use_verifiers=0`
      );
    });

    it("handles user contexts", () => {
      const contextId = 47;
      const params = {};
      const query = { contextType: "user", contextId, per_page: 50 };
      const path = canvasPath({ params, query });
      assert(
        path ===
          `/api/v1/users/${contextId}/files?per_page=50&content_types[]=image&use_verifiers=0`
      );
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
            id: 1,
            filename: "filename",
            thumbnail_url: "thumbnail.jpg",
            display_name: "look!",
            url: "URL",
            other: "unused_field"
          }
        ];
        canvasResponseHandler(request, response, canvasResponse);
      });

      it("simplifes API response", () => {
        sinon.assert.calledWithMatch(response.send, val => {
          return val.images[0].id == 1 && val.images[0].other === undefined;
        });
      });

      it("uses the big image for the href (which is for embedding)", () => {
        sinon.assert.calledWithMatch(response.send, val => {
          return (
            val.images[0].thumbnail_url == "thumbnail.jpg" &&
            val.images[0].preview_url == "URL" &&
            val.images[0].href == "URL"
          );
        });
      });
    });
  });
});
