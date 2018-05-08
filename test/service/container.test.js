"use strict";

const { equal } = require("assert");
const container = require("../../app/container");

describe("container", () => {
  it("returns a working container", () => {
    const provider = { init: () => ({}), singleton: true };
    equal(container.make(provider), container.make(provider));
  });
});
