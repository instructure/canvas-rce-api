"use strict";

const configs = require("../config");
const { getByPath } = require("./utils/object");
const ConfigRequiredException = require("./exceptions/ConfigRequiredException");
const _env = require("./env");

function inject(provide) {
  return [_env, provide(configs)];
}

function init(env, configs) {
  const store = {};
  Object.keys(configs).forEach(key => (store[key] = configs[key](env)));

  const config = {
    get(path, fallback = () => null) {
      const val = getByPath(path, store);
      return val != null ? val : fallback();
    },

    require(path) {
      const val = config.get(path);
      if (val == null) {
        throw ConfigRequiredException.forPath(path);
      }
      return val;
    }
  };

  return config;
}

module.exports = { inject, init, singleton: true };
