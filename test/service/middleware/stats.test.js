"use strict";

const StatsMiddleware = require("../../../app/middleware/stats");
const dgram = require("dgram");
const getPort = require("get-port");
const fakeConfig = require("../../support/fakeConfig");
const { EventEmitter } = require("events");
const sinon = require("sinon");
const assert = require("assert");

describe("StatsMiddleware", () => {
  let statsServer, req, res, envOverrides, clock, next;

  beforeEach(async () => {
    clock = sinon.useFakeTimers();
    next = sinon.spy();
    envOverrides = {
      STATSD_HOST: "127.0.0.1",
      STATSD_PORT: await getPort(),
      STATS_PREFIX: "prefix",
      CG_ENVIRONMENT: "env",
      DOG_TAGS: "false"
    };
    req = { actionKey: "foo" };
    res = new EventEmitter();
    statsServer = dgram.createSocket("udp4");
    statsServer.bind(envOverrides.STATSD_PORT);
  });

  afterEach(() => {
    clock.restore();
    statsServer.removeAllListeners();
    statsServer.close();
  });

  const run = () => {
    const mw = new StatsMiddleware(fakeConfig(envOverrides));
    mw.handle(req, res, next);
  };

  const message = (nth = 1) =>
    new Promise((resolve, reject) => {
      statsServer.once("message", msg => {
        statsServer.removeAllListeners();
        resolve(msg.toString());
      });
      statsServer.once("error", err => {
        statsServer.removeAllListeners();
        reject(err);
      });
    }).then(msg => {
      if (nth > 1) {
        return message(nth - 1);
      }
      return msg;
    });

  const assertMsg = async (expected, nth) => {
    const pending = message(nth);
    res.emit("finish");
    const msg = await pending;
    assert.equal(msg, expected);
  };

  it("calls next synchronously", () => {
    run();
    sinon.assert.calledOnce(next);
  });

  describe("statsd", () => {
    it("logs request timing", async () => {
      run();
      clock.tick(100);
      await assertMsg("prefix.env.request.foo.response_time:100|ms", 2);
    });

    it("includes req timers", async () => {
      req.timers = { a: 1 };
      run();
      await assertMsg("prefix.env.request.foo.a:1|ms", 3);
    });

    it("includes status code counter", async () => {
      res.statusCode = 200;
      run();
      await assertMsg("prefix.env.request.foo.status_code.200:1|c");
    });

    it("includes unknown_status", async () => {
      run();
      await assertMsg("prefix.env.request.foo.status_code.unknown_status:1|c");
    });
  });

  describe("datadog", () => {
    beforeEach(() => {
      envOverrides.DOG_TAGS = "{}";
    });

    it("logs request timing", async () => {
      run();
      clock.tick(100);
      await assertMsg("prefix.env.request.response_time:100|ms|#action:foo", 2);
    });

    it("includes global tags", async () => {
      envOverrides.DOG_TAGS = '{"a":1}';
      run();
      await assertMsg(
        "prefix.env.request.response_time:0|ms|#a:1,action:foo",
        2
      );
    });

    it("includes req timers", async () => {
      req.timers = { a: 1 };
      run();
      await assertMsg("prefix.env.request.a:1|ms|#action:foo", 3);
    });

    it("includes status code counter", async () => {
      res.statusCode = 200;
      run();
      await assertMsg("prefix.env.request.response:1|c|#action:foo,status:200");
    });

    it("includes unknown_status", async () => {
      run();
      await assertMsg(
        "prefix.env.request.response:1|c|#action:foo,status:unknown_status"
      );
    });
  });

  describe("cleanup", () => {
    beforeEach(() => {
      res.removeListener = sinon.spy();
      run();
    });

    it("cleans up on finish", () => {
      res.emit("finish");
      sinon.assert.called(res.removeListener);
    });

    it("cleans up on error", () => {
      res.emit("error");
      sinon.assert.called(res.removeListener);
    });

    it("cleans up on close", () => {
      res.emit("close");
      sinon.assert.called(res.removeListener);
    });
  });
});
