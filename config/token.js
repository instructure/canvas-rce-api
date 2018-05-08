"use strict";

module.exports = env => ({
  encryptionSecret: env.require("ECOSYSTEM_KEY"),
  signingSecret: env.require("ECOSYSTEM_SECRET")
});
