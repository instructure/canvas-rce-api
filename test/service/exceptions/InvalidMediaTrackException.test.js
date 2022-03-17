"use strict";

const { equal, ok } = require("assert");
const InvalidMediaTrackException = require("../../../app/exceptions/InvalidMediaTrackException");

describe("InvalidMediaTrackException", () => {
  describe("missingLocale", () => {
    it("returns an InvalidMediaTrackException", () => {
      const err = InvalidMediaTrackException.missingLocale();
      ok(err instanceof InvalidMediaTrackException);
      equal(err.status, 400);
    });
  });
  describe("missingLocale", () => {
    it("returns an InvalidMediaTrackException", () => {
      const err = InvalidMediaTrackException.missingLocale();
      ok(err instanceof InvalidMediaTrackException);
      equal(err.status, 400);
    });
  });
  describe("badFormat", () => {
    it("returns an InvalidMediaTrackException", () => {
      const err = InvalidMediaTrackException.badFormat();
      ok(err instanceof InvalidMediaTrackException);
      equal(err.status, 400);
    });
  });
});
