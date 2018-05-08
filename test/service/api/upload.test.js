"use strict";

const assert = require("assert");
const sinon = require("sinon");
const {
  canvasPath,
  canvasResponseHandler,
  transformBody
} = require("../../../app/api/upload");

describe("Upload API", () => {
  describe("canvasPath()", () => {
    it("builds the correct path including context id", () => {
      const path = canvasPath({
        body: {
          contextType: "course",
          contextId: 47
        }
      });
      assert(path === `/api/v1/courses/47/files`);
    });

    it("handles group contexts", () => {
      const path = canvasPath({
        body: {
          contextType: "group",
          contextId: 47
        }
      });
      assert(path === `/api/v1/groups/47/files`);
    });

    it("handles user contexts", () => {
      const path = canvasPath({
        body: {
          contextType: "user",
          contextId: 47
        }
      });
      assert(path === `/api/v1/users/47/files`);
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
        status: 200,
        body: []
      };
    });

    it("sends status from canvasResponse", () => {
      canvasResponseHandler(request, response, canvasResponse);
      response.status.calledWith(canvasResponse.status);
    });

    it("sends body from canvasResponse", () => {
      canvasResponseHandler(request, response, canvasResponse);
      response.send.calledWith(canvasResponse.body);
    });
  });

  describe("transformBody", () => {
    let fixed;

    beforeEach(() => {
      fixed = transformBody({
        file: {
          name: "filename",
          size: 42,
          type: "jpeg",
          parentFolderId: 1
        }
      });
    });

    it("reshapes the body to the format canvas wants", () => {
      assert.equal(fixed.name, "filename");
      assert.equal(fixed.size, 42);
      assert.equal(fixed.contentType, "jpeg");
      assert.equal(fixed.parent_folder_id, 1);
    });

    it("renames files on duplicate instead of overwriting them", () => {
      assert.equal(fixed.on_duplicate, "rename");
    });

    it("has success include preview url", () => {
      assert.deepEqual(fixed.success_include, ["preview_url"]);
    });
  });
});
