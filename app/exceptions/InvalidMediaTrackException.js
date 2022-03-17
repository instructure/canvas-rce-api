"use strict";

const HandledException = require("./HandledException");

class InvalidMediaTrack extends HandledException {
  static missingLocale() {
    return new this(JSON.stringify({ error: "locale required" }), 400);
  }
  static badFormat() {
    return new this(
      JSON.stringify({ error: "expected an array of tracks" }),
      400
    );
  }
}

module.exports = InvalidMediaTrack;
