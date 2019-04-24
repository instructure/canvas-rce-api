"use strict";

const _config = require("../config");
const StatsD = require("hot-shots");

class StatsMiddleware {
  static inject() {
    return [_config];
  }

  static init(config) {
    return new this(config);
  }

  static actionKeyMiddleware(controller, action) {
    let actionKey = "";
    if (controller == null || action == null) {
      actionKey = "__path__";
    } else {
      actionKey = `${controller}.${action}`;
    }
    return (request, response, next) => {
      if (actionKey == "__path__") {
        actionKey = request.path
          .split("/")
          .join("-")
          .replace(/^-/, "");
      }
      request.actionKey = actionKey;
      next();
    };
  }

  constructor(config) {
    this.tags = config.require("stats.tags");
    this.prefix = config.get("stats.prefix", "");
    this.statsd = new StatsD({
      host: config.get("stats.host"),
      port: config.get("stats.port"),
      globalTags: typeof this.tags === "object" ? this.tags : {}
    });
    this.handle = this.handle.bind(this);
  }

  key(name) {
    return `${this.prefix}request.${name}`;
  }

  timing(long, short, tags, value) {
    this._write("timing", long, short, tags, value);
  }

  increment(long, short, tags, value = 1) {
    this._write("increment", long, short, tags, value);
  }

  _write(type, long, short, tags, value) {
    if (this.tags !== false) {
      // eslint-disable-next-line security/detect-object-injection
      this.statsd[type](this.key(short), value, { ...this.tags, ...tags });
    } else {
      // eslint-disable-next-line security/detect-object-injection
      this.statsd[type](this.key(long), value);
    }
  }

  handle(req, res, next) {
    const start = Date.now();
    req.timers = req.timers || {};
    const send = () => {
      const action = req.actionKey;
      const status = res.statusCode || "unknown_status";
      this.increment(`${action}.status_code.${status}`, "response", {
        action,
        status
      });
      const duration = Date.now() - start;
      this.timing(
        `${action}.response_time`,
        "response_time",
        { action },
        duration
      );
      for (const key in req.timers) {
        // eslint-disable-next-line security/detect-object-injection
        this.timing(`${action}.${key}`, key, { action }, req.timers[key]);
      }
      cleanup();
    };
    const cleanup = () => {
      res.removeListener("finish", send);
      res.removeListener("error", cleanup);
      res.removeListener("close", cleanup);
    };
    res.once("finish", send);
    res.once("error", cleanup);
    res.once("close", cleanup);
    next();
  }
}

module.exports = StatsMiddleware;
