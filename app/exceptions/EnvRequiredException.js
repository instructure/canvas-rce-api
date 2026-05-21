import { HandledException } from "./HandledException.js";

class EnvRequiredException extends HandledException {
  static forVar(name) {
    return new this(`Environment variable "${name}" is required`);
  }
}

export { EnvRequiredException };
