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
        const query = { per_page: 50 };
        const expectedPath = `/api/v1/folders/${id}/files?per_page=50&include[]=preview_url&use_verifiers=0`;
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
          id: 47,
          "content-type": "text/plain",
          display_name: "Foo",
          filename: "Foo.pdf",
          preview_url: "someCANVADOCSurl",
          url: "someurl"
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
        canvasResponseHandler(request, response, canvasResponse);
        response.send.calledWithMatch(val => {
          return sinon.match(
            {
              id: file.id,
              type: file["content-type"],
              name: file.display_name,
              url: file.url,
              embed: { type: "file" }
            },
            val[0]
          );
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
