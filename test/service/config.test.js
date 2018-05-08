"use strict";

const { equal, throws } = require("assert");
const _config = require("../../app/config");
const ConfigRequiredException = require("../../app/exceptions/ConfigRequiredException");

describe("config provider", () => {
  let env;
  let configs;
  let config;

  beforeEach(() => {
    env = {
      get(name) {
        if (name === "SECRET") {
          return "s3cret";
        }
      }
    };
    configs = {
      app: () => ({
        name: "test app"
      }),
      security: env => ({
        jwt: {
          secret: env.get("SECRET")
        }
      })
    };
    config = _config.init(env, configs);
  });

  describe("get", () => {
    it("returns the value if exists", () => {
      equal(config.get("app.name"), "test app");
    });

    it("gets values from env", () => {
      equal(config.get("security.jwt.secret"), "s3cret");
    });

    it("returns null if it does not exist", () => {
      equal(config.get("app.other"), null);
    });

    it("executes and returns fallback if it does not exist", () => {
      equal(config.get("app.other", () => "fallback"), "fallback");
    });
  });

  describe("require", () => {
    it("returns the value if exists", () => {
      equal(config.require("app.name"), "test app");
    });

    it("throws EnvRequiredException if it does not exist", () => {
      throws(() => config.require("app.other"), ConfigRequiredException);
    });
  });
});
