"use strict";

const EnvRequiredException = require("./exceptions/EnvRequiredException");

function inject(provide) {
  return [provide(process.env)];
}

function init(vars) {
  const env = {
    get(name, fallback = () => null) {
      return vars[name] || fallback();
    },

    require(name) {
      const val = env.get(name);
      if (val == null) {
        throw EnvRequiredException.forVar(name);
      }
      return val;
    }
  };

  return env;
}

module.exports = { inject, init, singleton: true };
