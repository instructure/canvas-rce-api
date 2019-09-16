"use strict";

const assert = require("assert");
const sinon = require("sinon");
const {
  canvasPath,
  canvasResponseHandler
} = require("../../../app/api/documents");

describe("Documents API", () => {
  describe("canvasPath()", () => {
    it("builds the correct path including context id", () => {
      const id = 47;
      const params = {};
      const query = { contextId: id, contextType: "course", per_page: 50 };
      const path = canvasPath({ params, query });
      assert(
        path === `/api/v1/courses/${id}/files?per_page=50&use_verifiers=0`
      );
    });

    it("handles group contexts", () => {
      const contextId = 47;
      const params = {};
      const query = { contextType: "group", contextId, per_page: 50 };
      const path = canvasPath({ params, query });
      assert(
        path === `/api/v1/groups/${contextId}/files?per_page=50&use_verifiers=0`
      );
    });

    it("handles user contexts", () => {
      const contextId = 47;
      const params = {};
      const query = { contextType: "user", contextId, per_page: 50 };
      const path = canvasPath({ params, query });
      assert(
        path === `/api/v1/users/${contextId}/files?per_page=50&use_verifiers=0`
      );
    });

    it("builds the correct path including content_types", () => {
      const id = 47;
      const params = {};
      const query = {
        contextId: id,
        contextType: "course",
        content_types: "text,application",
        per_page: 50
      };
      const path = canvasPath({ params, query });
      assert(
        path ===
          `/api/v1/courses/${id}/files?per_page=50&use_verifiers=0&content_types[]=text&content_types[]=application`
      );
    });

    it("builds the correct path including exclude_content_types", () => {
      const id = 47;
      const params = {};
      const query = {
        contextId: id,
        contextType: "course",
        exclude_content_types: "text,application",
        per_page: 50
      };
      const path = canvasPath({ params, query });
      assert(
        path ===
          `/api/v1/courses/${id}/files?per_page=50&use_verifiers=0&exclude_content_types[]=text&exclude_content_types[]=application`
      );
    });

    it("builds the correct path including sort order", () => {
      const id = 47;
      const params = {};
      const query = {
        contextId: id,
        contextType: "course",
        sort: "name",
        per_page: 50
      };
      const path = canvasPath({ params, query });
      assert(
        path ===
          `/api/v1/courses/${id}/files?per_page=50&use_verifiers=0&sort=name&order=asc`
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
            "content-type": "image/jpg",
            thumbnail_url: "thumbnail.jpg",
            display_name: "look!",
            url: "URL",
            other: "unused_field",
            locked: true,
            hidden: true,
            locked_for_user: true,
            unlock_at: "tomorrow",
            lock_at: "next week",
            created_at: "last week"
          }
        ];
        canvasResponseHandler(request, response, canvasResponse);
      });

      it("transforms the API response", () => {
        sinon.assert.calledWithMatch(response.send, val => {
          return (
            val.bookmark === null &&
            val.files[0].id === 1 &&
            val.files[0].filename === "filename" &&
            val.files[0].display_name === "look!" &&
            val.files[0].thumbnail_url === "thumbnail.jpg" &&
            "preview_url" in val.files[0] &&
            val.files[0].preview_url === undefined &&
            val.files[0].href === "URL" &&
            val.files[0].content_type === "image/jpg" &&
            val.files[0].published === false && // from locked
            val.files[0].hidden_to_user === true && // from hidden
            val.files[0].locked_for_user === true &&
            val.files[0].unlock_at === "tomorrow" &&
            val.files[0].lock_at === "next week" &&
            val.files[0].date === "last week"
          );
        });
      });
    });
  });
});
