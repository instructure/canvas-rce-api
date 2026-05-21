import _config from "../../app/config.js";
import _env from "../../app/env.js";
import configs from "../../config/index.js";

function fakeConfig(envOverrides = {}, configOverrides = {}) {
  const env = _env.init({ ...process.env, ...envOverrides });
  const conf = { ...configs, ...configOverrides };
  return _config.init(env, conf);
}

export { fakeConfig };
