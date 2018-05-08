"use strict";

const { ok, equal, throws } = require("assert");
const { canvasPath, transformBody } = require("../../../app/api/usageRights");

describe("Usage Rights API", () => {
  describe("canvasPath()", () => {
    describe("course context", () => {
      it("builds the correct path includeing context id", () => {
        const req = {
          auth: { payload: { context_type: "Course", context_id: 47 } }
        };
        const path = canvasPath(req);
        equal(path, `/api/v1/courses/47/usage_rights`);
      });
    });

    describe("group context", () => {
      it("builds the correct path includeing context id", () => {
        const req = {
          auth: { payload: { context_type: "Group", context_id: 47 } }
        };
        const path = canvasPath(req);
        equal(path, `/api/v1/groups/47/usage_rights`);
      });
    });

    describe("user context", () => {
      it("builds the correct path including context id", () => {
        const req = {
          auth: { payload: { context_type: "User", context_id: 47 } }
        };
        const path = canvasPath(req);
        equal(path, `/api/v1/users/47/usage_rights`);
      });
    });

    it("dies on other contexts", () => {
      const query = { contextType: "NotAContext", contextId: 1, per_page: 50 };
      throws(() => canvasPath({ params: {}, query: query }));
    });
  });

  describe("transformBody()", () => {
    it("returns a url encoded string file ids in correct array format", () => {
      const body = transformBody({ fileId: 47 });
      ok(/file_ids%5B%5D=47/.test(body));
    });

    it("sets publish to true", () => {
      const body = transformBody({ fileId: 47 });
      ok(/publish=true/.test(body));
    });

    it("sets usage rights data", () => {
      const body = transformBody({
        usageRight: "foo",
        copyrightHolder: "bar",
        ccLicense: "baz"
      });
      ok(/usage_rights%5Buse_justification%5D=foo/.test(body));
      ok(/usage_rights%5Blegal_copyright%5D=bar/.test(body));
      ok(/usage_rights%5Blicense%5D=baz/.test(body));
    });
  });
});
