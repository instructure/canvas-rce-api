"use strict";

const assert = require("assert");
const sinon = require("sinon");
const { canvasPath, canvasResponseHandler } = require("../../../app/api/files");

describe("Files API", () => {
  describe("canvasPath()", () => {
    describe("files in specific folder", () => {
      it("builds the correct path including folder id", () => {
        const id = 47;
        const params = { folderId: id };
        const query = {
          contextType: "course",
          contextId: "nomatter",
          per_page: 50
        };
        const expectedPath = `/api/v1/folders/${id}/files?per_page=50&include[]=preview_url&use_verifiers=0`;
        assert.equal(canvasPath({ params, query }), expectedPath);
      });

      it("builds the correct path for the user context", () => {
        const params = {};
        const query = { contextType: "user", contextId: "17", per_page: 50 };
        const expectedPath = `/api/v1/users/${query.contextId}/files?per_page=50&include[]=preview_url&use_verifiers=0`;
        assert.equal(canvasPath({ params, query }), expectedPath);
      });

      it("builds the correct path with search_term present", () => {
        const id = 47;
        const params = { folderId: id };
        const query = {
          contextType: "course",
          contextId: "nomatter",
          per_page: 50,
          search_term: "banana"
        };
        const expectedPath = `/api/v1/folders/${id}/files?per_page=50&include[]=preview_url&use_verifiers=0&search_term=banana`;
        assert.equal(canvasPath({ params, query }), expectedPath);
      });

      it("builds the correct path with sort and order present", () => {
        const id = 47;
        const params = { folderId: id };
        const query = {
          contextType: "course",
          contextId: "nomatter",
          per_page: 50,
          sort: "created_at",
          order: "desc"
        };
        const expectedPath = `/api/v1/folders/${id}/files?per_page=50&include[]=preview_url&use_verifiers=0&sort=created_at&order=desc`;
        assert.equal(canvasPath({ params, query }), expectedPath);
      });
    });
  });

  describe("canvasResponseHandler()", () => {
    let request, response, canvasResponse;

    beforeEach(() => {
      request = { get: () => {} };
      response = {
        status: sinon.spy(),
        send: sinon.spy()
      };
      canvasResponse = {
        status: 200,
        body: []
      };
    });

    it("sends status from canvasResponse", () => {
      canvasResponseHandler(request, response, canvasResponse);
      response.status.calledWith(canvasResponse.status);
    });

    it("sends body from canvasResponse for non-200 responses", () => {
      canvasResponse.status = 400;
      canvasResponseHandler(request, response, canvasResponse);
      response.send.calledWith(canvasResponse.body);
    });

    describe("transformed response body", () => {
      let file = null;

      beforeEach(() => {
        file = {
          created_at: "2021-08-12T18:30:53Z",
          id: 47,
          uuid: "123123123asdf",
          "content-type": "text/plain",
          display_name: "Foo",
          filename: "Foo.pdf",
          preview_url: "someCANVADOCSurl",
          url: "someurl",
          folder_id: 1,
          embedded_iframe_url: "https://canvas.com/foo/bar",
          thumbnail_url: "https://canvas.com/foo/bar/thumbnail"
        };
      });

      it("creates files array property with items from response body", () => {
        canvasResponse.body = [{}, {}, {}];
        canvasResponseHandler(request, response, canvasResponse);
        response.send.calledWithMatch(val => {
          return (
            Array.isArray(val.files) &&
            val.files.length === canvasResponse.body.length
          );
        });
      });

      it("files have correctly tranformed properties", () => {
        canvasResponse.body = [file];
        canvasResponse.statusCode = 200;
        canvasResponseHandler(request, response, canvasResponse);
        assert.deepStrictEqual(response.send.firstCall.args[0].files[0], {
          createdAt: "2021-08-12T18:30:53Z",
          id: 47,
          uuid: "123123123asdf",
          type: "text/plain",
          name: "Foo",
          url: "someurl",
          embed: { type: "scribd" },
          folderId: 1,
          iframeUrl: "https://canvas.com/foo/bar",
          thumbnailUrl: "https://canvas.com/foo/bar/thumbnail"
        });
      });

      it("will use fallbacks for name", () => {
        file.display_name = undefined;
        canvasResponse.body = [file];
        canvasResponseHandler(request, response, canvasResponse);
        response.send.calledWithMatch(val => {
          return sinon.match({ name: file.filename }, val[0]);
        });
      });

      it("has bookmark from canvasResponse", () => {
        canvasResponse.bookmark = "foo";
        canvasResponseHandler(request, response, canvasResponse);
        response.send.calledWithMatch(val => {
          return /foo/.test(val.bookmark);
        });
      });

      it("has null bookmark if canvasResponse does not have one", () => {
        canvasResponse.bookmark = undefined;
        canvasResponseHandler(request, response, canvasResponse);
        response.send.calledWithMatch(val => {
          return val.bookmark === null;
        });
      });
    });
  });
});
