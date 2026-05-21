import { HandledException } from "./HandledException.js";

class InvalidMediaTrack extends HandledException {
  static missingLocale() {
    return new this(JSON.stringify({ error: "locale required" }), 400);
  }
  static badFormat() {
    return new this(
      JSON.stringify({ error: "expected an array of tracks" }),
      400,
    );
  }
}

export { InvalidMediaTrack };
