"use strict";

const { equal, throws } = require("assert");
const _env = require("../../app/env");
const EnvRequiredException = require("../../app/exceptions/EnvRequiredException");
const { InvalidArgumentException } = require("node-exceptions");

describe("env provider", () => {
  let vars;
  let env;

  beforeEach(() => {
    vars = {
      KEY: "thekey",
      SECRET: "s3cret"
    };
    env = _env.init(vars);
  });

  describe("get", () => {
    it("returns the value if exists", () => {
      equal(env.get("KEY"), vars.KEY);
    });

    it("returns null if it does not exist", () => {
      equal(env.get("OTHER"), null);
    });

    it("executes and returns fallback if it does not exist", () => {
      equal(env.get("OTHER", () => "fallback"), "fallback");
    });

    it("throws an error if fallback is provided and is not a function", () => {
      throws(() => env.get("OTHER", "string"), InvalidArgumentException);
    });
  });

  describe("require", () => {
    it("returns the value if exists", () => {
      equal(env.require("KEY"), vars.KEY);
    });

    it("throws EnvRequiredException if it does not exist", () => {
      throws(() => env.require("OTHER"), EnvRequiredException);
    });
  });
});
