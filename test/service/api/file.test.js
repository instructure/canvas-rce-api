"use strict";

const assert = require("assert");
const sinon = require("sinon");
const { canvasPath, canvasResponseHandler } = require("../../../app/api/file");

describe("File API", () => {
  describe("canvasPath()", () => {
    it("builds the correct path including file id", () => {
      const id = 47;
      const params = { fileId: id };
      const query = { per_page: 50 };
      const expectedPath = `/api/v1/files/${id}`;
      assert.equal(canvasPath({ params, query }), expectedPath);
    });
  });

  describe("canvasResponseHandler()", () => {
    let request, response, canvasResponse;

    beforeEach(() => {
      request = {};
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

      it("file has correctly tranformed properties", () => {
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
            val
          );
        });
      });

      it("will use fallbacks for name", () => {
        file.display_name = undefined;
        canvasResponse.body = [file];
        canvasResponseHandler(request, response, canvasResponse);
        response.send.calledWithMatch(val => {
          return sinon.match({ name: file.filename }, val);
        });
      });
    });
  });
});
