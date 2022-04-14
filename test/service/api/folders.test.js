"use strict";

const assert = require("assert");
const sinon = require("sinon");
const {
  canvasPath,
  canvasResponseHandler
} = require("../../../app/api/folders");

describe("Folders API", () => {
  describe("canvasPath()", () => {
    describe("folders in specific folder", () => {
      it("builds the correct path including folder id", () => {
        const id = 47;
        const params = { folderId: id };
        const query = { per_page: 50 };
        assert(
          canvasPath({ params, query }) ===
            `/api/v1/folders/${id}/folders?per_page=50`
        );
      });
    });

    describe("course context", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = {};
        const query = { contextType: "course", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(
          path === `/api/v1/courses/${contextId}/folders/by_path?per_page=50`
        );
      });
    });

    describe("group context", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = {};
        const query = { contextType: "group", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(
          path === `/api/v1/groups/${contextId}/folders/by_path?per_page=50`
        );
      });
    });

    describe("user context", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = {};
        const query = { contextType: "user", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(
          path === `/api/v1/users/${contextId}/folders/by_path?per_page=50`
        );
      });
    });

    describe("course context all folders", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "all" };
        const query = { contextType: "course", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/courses/${contextId}/folders?per_page=50`);
      });
    });

    describe("group context all folders", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "all" };
        const query = { contextType: "group", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/groups/${contextId}/folders?per_page=50`);
      });
    });

    describe("user context all folders", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "all" };
        const query = { contextType: "user", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/users/${contextId}/folders?per_page=50`);
      });
    });

    it("dies on other contexts", () => {
      const query = { contextType: "NotAContext", contextId: 1, per_page: 50 };
      assert.throws(() => canvasPath({ params: {}, query: query }));
    });

    describe("course context icon maker folder", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "icon_maker" };
        const query = { contextType: "course", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/courses/${contextId}/folders/icon_maker`);
      });
    });

    describe("course context media folder", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "media" };
        const query = { contextType: "course", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/courses/${contextId}/folders/media`);
      });
    });

    describe("group context media folder", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "media" };
        const query = { contextType: "group", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/groups/${contextId}/folders/media`);
      });
    });

    describe("user context media folder", () => {
      it("builds the correct path including context id", () => {
        const contextId = 47;
        const params = { folderId: "media" };
        const query = { contextType: "user", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/users/${contextId}/folders/media`);
      });
    });
  });

  describe("canvasResponseHandler()", () => {
    let request, response, canvasResponse, forwardedProto;

    beforeEach(() => {
      forwardedProto = null;
      request = {
        protocol: "http",
        get: key => {
          switch (key) {
            case "host":
              return "canvashost";
            case "X-Forwarded-Proto":
              return forwardedProto;
          }
        }
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
      it("creates folders array with items from response body", () => {
        canvasResponse.body = [{}, {}, {}];
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return (
            Array.isArray(val.folders) &&
            val.folders.length === canvasResponse.body.length
          );
        });
      });

      it("works with a non-array response value converting it to an array", () => {
        canvasResponse.body = {};
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return Array.isArray(val.folders) && val.folders.length === 1;
        });
      });

      it("folders have correctly tranformed properties", () => {
        const folder = {
          id: 47,
          name: "Foo",
          parent_folder_id: 2,
          locked_for_user: true,
          context_type: "Course",
          context_id: 22,
          can_upload: true
        };
        canvasResponse.body = [folder];
        canvasResponseHandler(request, response, canvasResponse);

        assert.deepStrictEqual(response.send.firstCall.args[0].folders[0], {
          canUpload: folder.can_upload,
          contextId: folder.context_id,
          contextType: folder.context_type,
          filesUrl: "http://canvashost/api/files/47",
          foldersUrl: "http://canvashost/api/folders/47",
          id: folder.id,
          lockedForUser: folder.locked_for_user,
          name: folder.name,
          parentId: folder.parent_folder_id
        });
      });

      it("builds the correct files url", () => {
        const folder = { id: 47 };
        canvasResponse.body = [folder];
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          const baseUrl = `${request.protocol}://${request.get("host")}/api`;
          return val.folders[0].filesUrl === `${baseUrl}/files/${folder.id}`;
        });
      });

      it("builds the correct folders url", () => {
        const folder = { id: 47 };
        canvasResponse.body = [folder];
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          const baseUrl = `${request.protocol}://${request.get("host")}/api`;
          return (
            val.folders[0].foldersUrl === `${baseUrl}/folders/${folder.id}`
          );
        });
      });

      it("uses forwarded proto for urls if available", () => {
        forwardedProto = "https";
        const folder = { id: 47 };
        canvasResponse.body = [folder];
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          const baseUrl = `${forwardedProto}://${request.get("host")}/api`;
          return (
            val.folders[0].filesUrl === `${baseUrl}/files/${folder.id}` &&
            val.folders[0].foldersUrl === `${baseUrl}/folders/${folder.id}`
          );
        });
      });

      it("has bookmark from canvasResponse", () => {
        canvasResponse.bookmark = "foo";
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return /foo/.test(val.bookmark);
        });
      });

      it("has null bookmark if canvasResponse does not have one", () => {
        canvasResponse.bookmark = undefined;
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return val.bookmark === null;
        });
      });
    });
  });
});
