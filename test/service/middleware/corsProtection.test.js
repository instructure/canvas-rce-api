import assert from "assert";

import * as corsProtection from "../../../app/middleware/corsProtection.js";

describe("corsProtection", function () {
  describe("validateOrigin", function () {
    it("allows everything", function (done) {
      corsProtection.validateOrigin("http://lvh.me", function (_, validated) {
        assert(validated);
        done();
      });
    });

    it("approves undefined origins", function (done) {
      corsProtection.validateOrigin(undefined, function (_, validated) {
        assert(validated);
        done();
      });
    });
  });
});
