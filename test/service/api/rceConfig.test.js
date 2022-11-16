"use strict";

const assert = require("assert");

const { canvasPath } = require("../../../app/api/rceConfig");

describe("RCE config API", () => {
  describe("canvasPath", () => {
    it("builds the correct path including with course_id parameter", () => {
      const path = canvasPath({
        query: { contextType: "course", contextId: "1" }
      });
      assert.ok(path.match("/api/v1/services/rce_config\\?course_id=1"));
    });

    it("builds the correct path including with user_id parameter", () => {
      const path = canvasPath({
        query: { contextType: "user", contextId: "1" }
      });
      assert.ok(path.match("/api/v1/services/rce_config\\?user_id=1"));
    });

    it("builds the correct path including with group_id parameter", () => {
      const path = canvasPath({
        query: { contextType: "group", contextId: "1" }
      });
      assert.ok(path.match("/api/v1/services/rce_config\\?group_id=1"));
    });

    it("builds the correct path including with account_id parameter", () => {
      const path = canvasPath({
        query: { contextType: "account", contextId: "101230234" }
      });
      assert.ok(path.match("/api/v1/services/rce_config\\?account_id=101230234"));
    });

    it("throws error in case of missing context type", () => {
      assert.throws(() => canvasPath({ query: { contextId: "1" } }));
    });

    it("throws error in case of invalid context type", () => {
      assert.throws(() =>
        canvasPath({ query: { contextType: "asd", contextId: "1" } })
      );
    });

    it("throws error in case of missing context id", () => {
      assert.throws(() => canvasPath({ query: { contextType: "asd" } }));
    });
  });
});
