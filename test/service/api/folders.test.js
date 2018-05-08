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
      it("builds the correct path includeing context id", () => {
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
      it("builds the correct path includeing context id", () => {
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
      it("builds the correct path includeing context id", () => {
        const contextId = 47;
        const params = { folderId: "all" };
        const query = { contextType: "course", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/courses/${contextId}/folders?per_page=50`);
      });
    });

    describe("group context all folders", () => {
      it("builds the correct path includeing context id", () => {
        const contextId = 47;
        const params = { folderId: "all" };
        const query = { contextType: "group", contextId, per_page: 50 };
        const path = canvasPath({ params, query });
        assert(path === `/api/v1/groups/${contextId}/folders?per_page=50`);
      });
    });

    describe("user context all folders", () => {
      it("builds the correct path includeing context id", () => {
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
        status: 200,
        body: []
      };
    });

    it("sends status from canvasResponse", () => {
      canvasResponseHandler(request, response, canvasResponse);
      sinon.assert.calledWith(response.status, canvasResponse.status);
    });

    it("sends body from canvasResponse for non-200 responses", () => {
      canvasResponse.status = 400;
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

      it("folders have correctly tranformed properties", () => {
        const folder = {
          id: 47,
          name: "Foo"
        };
        canvasResponse.body = [folder];
        canvasResponseHandler(request, response, canvasResponse);
        sinon.assert.calledWithMatch(response.send, val => {
          return sinon.match(
            {
              id: folder.id,
              name: folder.name
            },
            val[0]
          );
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
