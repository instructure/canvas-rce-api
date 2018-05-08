"use strict";

const assert = require("assert");
const sign = require("../../../app/utils/sign");
const sinon = require("sinon");

describe("sign util", () => {
  let originalSecret, clock;

  beforeEach(() => {
    originalSecret = process.env.ECOSYSTEM_SECRET;
    process.env.ECOSYSTEM_SECRET = "testsecret";
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    process.env.ECOSYSTEM_SECRET = originalSecret;
    clock.restore();
  });

  it("verify returns null if null", () => {
    assert.strictEqual(sign.verify(null), null);
  });

  it("verify returns null if undefined", () => {
    assert.strictEqual(sign.verify(undefined), null);
  });

  it("verify returns null if invalid", () => {
    assert.strictEqual(sign.verify("invalid"), null);
  });

  it("verify returns string if valid", () => {
    const val = "valuetosign";
    const signed = sign.sign(val);
    assert.strictEqual(sign.verify(signed), val);
  });

  it("verify returns null if expired", () => {
    const val = "valuetosign";
    const signed = sign.sign(val, 1);
    clock.tick(2000);
    assert.strictEqual(sign.verify(signed), null);
  });

  it("verify returns null if expired", () => {
    const val = "valuetosign";
    const signed = sign.sign(val, 1);
    clock.tick(1000);
    assert.strictEqual(sign.verify(signed), null);
  });

  it("verify returns null if tampered with", () => {
    const val = "valuetosign";
    const signed = sign.sign(val);
    const parts = signed.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64"));
    payload.val = "othervalue";
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64");
    const invalid = parts.join(".");
    assert.strictEqual(sign.verify(invalid), null);
  });

  it("expires in 24 hours by default", () => {
    const val = "valuetosign";
    const signed = sign.sign(val);
    clock.tick(24 * 60 * 60 * 1000 - 1);
    assert.strictEqual(sign.verify(signed), val);
    clock.tick(1);
    assert.strictEqual(sign.verify(signed), null);
  });

  it("sign allows setting expiration seconds", () => {
    const val = "valuetosign";
    const signed = sign.sign(val, 3);
    clock.tick(2000);
    assert.strictEqual(sign.verify(signed), val);
    clock.tick(1000);
    assert.strictEqual(sign.verify(signed), null);
  });
});
