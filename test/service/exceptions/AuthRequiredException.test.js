"use strict";

const { equal, ok } = require("assert");
const AuthRequiredException = require("../../../app/exceptions/AuthRequiredException");

describe("AuthRequiredException", () => {
  describe("tokenMissing", () => {
    let err;

    beforeEach(() => {
      err = AuthRequiredException.tokenMissing();
    });

    it("returns an AuthRequiredException", () => {
      ok(err instanceof AuthRequiredException);
    });

    it("has a status of 401", () => {
      equal(err.status, 401);
    });
  });
});
