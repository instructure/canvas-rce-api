"use strict";

module.exports = env => ({
  host: env.require("STATSD_HOST"),
  port: env.require("STATSD_PORT"),
  tags: JSON.parse(env.get("DOG_TAGS", () => "false")),
  prefix: `${env.get("STATS_PREFIX", () => "rce-api")}.${env.get(
    "CG_ENVIRONMENT",
    () => "dev"
  )}.`
});
