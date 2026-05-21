import { equal, ok } from "assert";

import { ConfigRequiredException } from "../../../app/exceptions/ConfigRequiredException.js";

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
