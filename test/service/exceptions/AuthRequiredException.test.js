import { equal, ok } from "assert";

import { AuthRequiredException } from "../../../app/exceptions/AuthRequiredException.js";

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
