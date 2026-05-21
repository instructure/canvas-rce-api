import configs from "../config/index.js";

import _env from "./env.js";
import { ConfigRequiredException } from "./exceptions/ConfigRequiredException.js";
import { getByPath } from "./utils/object.js";

function inject(provide) {
  return [_env, provide(configs)];
}

function init(env, configs) {
  const store = {};
  Object.keys(configs).forEach((key) => (store[key] = configs[key](env)));

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
    },
  };

  return config;
}

export default { inject, init, singleton: true };
