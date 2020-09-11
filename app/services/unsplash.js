"use strict";

const Unsplash = require("unsplash-js").default;
const _env = require("../env");

function inject() {
  return [_env];
}

function init(env) {
  return new Unsplash({
    accessKey: env.get("UNSPLASH_APP_ID", () => "fake_app_id"),
    secret: env.get("UNSPLASH_SECRET", () => "fake_secret")
  });
}

module.exports = { inject, init };
