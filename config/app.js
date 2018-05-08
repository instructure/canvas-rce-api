"use strict";

module.exports = env => ({
  environment: env.get("NODE_ENV", () => "development")
});
