"use strict";

const { equal, deepEqual } = require("assert");
const object = require("../../../app/utils/object");

describe("object utils", () => {
  describe("getByPath", () => {
    let obj;

    beforeEach(() => {
      obj = { a: { b: { c: 47 } } };
    });

    it("finds nested keys", () => {
      equal(object.getByPath("a.b.c", obj), 47);
      deepEqual(object.getByPath("a.b", obj), { c: 47 });
    });

    it("returns null for keys of non-objects", () => {
      equal(object.getByPath("a.b.c.d"), null);
    });

    it("returns nul for for keys that don't exist", () => {
      equal(object.getByPath("a.c"), null);
    });
  });

  describe("getArrayQueryParam", () => {
    it("returns array if param is an array", () => {
      const list = object.getArrayQueryParam(["a", "b"]);
      deepEqual(list, ["a", "b"]);
    });

    it("return array from comma separated string", () => {
      const list = object.getArrayQueryParam("a,b");
      deepEqual(list, ["a", "b"]);
    });

    it("returns the empty string if param is undefined", () => {
      const list = object.getArrayQueryParam();
      equal(list, "");
    });
  });
});
