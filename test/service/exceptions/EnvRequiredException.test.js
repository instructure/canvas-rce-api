"use strict";

const { equal, ok } = require("assert");
const EnvRequiredException = require("../../../app/exceptions/EnvRequiredException");

describe("EnvRequiredException", () => {
  describe("forVar", () => {
    let err;

    beforeEach(() => {
      err = EnvRequiredException.forVar("KEY");
    });

    it("returns an EnvRequiredException", () => {
      ok(err instanceof EnvRequiredException);
    });

    it("message includes var name", () => {
      ok(/KEY/.test(err.message));
    });

    it("has a status of 500", () => {
      equal(err.status, 500);
    });
  });
});
