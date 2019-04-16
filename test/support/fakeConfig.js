"use strict";

const _config = require("../../app/config");
const _env = require("../../app/env");
const configs = require("../../config");

function fakeConfig(envOverrides = {}, configOverrides = {}) {
  const env = _env.init({ ...process.env, ...envOverrides });
  const conf = { ...configs, ...configOverrides };
  return _config.init(env, conf);
}

module.exports = fakeConfig;
