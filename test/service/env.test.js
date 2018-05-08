"use strict";

const { equal, throws } = require("assert");
const _env = require("../../app/env");
const EnvRequiredException = require("../../app/exceptions/EnvRequiredException");

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
