"use strict";

const { equal, ok } = require("assert");
const ConfigRequiredException = require("../../../app/exceptions/ConfigRequiredException");

describe("ConfigRequiredException", () => {
  describe("forPath", () => {
    let err;

    beforeEach(() => {
      err = ConfigRequiredException.forPath("a.b");
    });

    it("returns an ConfigRequiredException", () => {
      ok(err instanceof ConfigRequiredException);
    });

    it("message includes config path", () => {
      ok(/a\.b/.test(err.message));
    });

    it("has a status of 500", () => {
      equal(err.status, 500);
    });
  });
});
