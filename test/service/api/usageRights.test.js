"use strict";

const { equal, throws } = require("assert");
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
    it("includes file id in array", () => {
      const body = transformBody({ fileId: 47 });
      equal(body.file_ids[0], 47);
    });

    it("sets publish to true", () => {
      const body = transformBody({ fileId: 47 });
      equal(body.publish, true);
    });

    it("sets usage rights data", () => {
      const body = transformBody({
        usageRight: "foo",
        copyrightHolder: "bar",
        ccLicense: "baz"
      });
      equal(body.usage_rights.use_justification, "foo");
      equal(body.usage_rights.legal_copyright, "bar");
      equal(body.usage_rights.license, "baz");
    });
  });
});
