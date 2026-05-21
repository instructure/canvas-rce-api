import { HandledException } from "./HandledException.js";

class ConfigRequiredException extends HandledException {
  static forPath(path) {
    return new this(`Configuration required for "${path}"`);
  }
}

export { ConfigRequiredException };
