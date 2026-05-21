import { HandledException } from "./HandledException.js";

class AuthRequiredException extends HandledException {
  static tokenMissing() {
    return new this("Authorization token required", 401);
  }
}

export { AuthRequiredException };
