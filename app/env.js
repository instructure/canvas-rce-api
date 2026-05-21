import { EnvRequiredException } from "./exceptions/EnvRequiredException.js";

function inject(provide) {
  return [provide(process.env)];
}

function init(vars) {
  const env = {
    get(name, fallback = () => null) {
      if (typeof fallback !== "function") {
        throw new TypeError("fallback must be a function");
      }
      return vars[name] || fallback();
    },

    require(name) {
      const val = env.get(name);
      if (val == null) {
        throw EnvRequiredException.forVar(name);
      }
      return val;
    },
  };

  return env;
}

export default { inject, init, singleton: true };
