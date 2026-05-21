import { equal } from "assert";

import container from "../../app/container.js";

describe("container", () => {
  it("returns a working container", () => {
    const provider = { init: () => ({}), singleton: true };
    equal(container.make(provider), container.make(provider));
  });
});
