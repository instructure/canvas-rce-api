import { equal, ok } from "assert";

import { InvalidMediaTrack as InvalidMediaTrackException } from "../../../app/exceptions/InvalidMediaTrackException.js";

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
