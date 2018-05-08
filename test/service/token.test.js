"use strict";

const sinon = require("sinon");
const assert = require("assert");
const TokenInvalidException = require("../../app/exceptions/TokenInvalidException");
const _token = require("../../app/token");

const CANVAS_TOKEN =
  "ZXlKaGJHY2lPaUprYVhJaUxDSmxibU1pT2lKQk1qVTJSME5OSW4wLi5iM2hpanZGMUxWWGNERVlzLk1uMWdpMDVuR0xQVDBJQlVzNkdKOVdjYWVCR0pHTXZKMHV1S2JrS0RXTm5zQ01vUldxbDNMcTExSjRsbjJKRkJLTWpRVFpBd1F2QkROVFdveUoyRnFiYVJIbzZpVlI2MTlIRUo5ZkVEdXBOd3llR1pkY1RwQzVST3g0VmRkNlBBQk1uYWpjWVJDY3VCcDlJZm5ERjFDRHgyYVFJNGZBVDJpeEJ2WnR2RFh0OE5ZOGVQZFU1VW9Vbm9YY0xucEROMWF2UFlaNkFxNnBIOVFSVWpvdFdpU29Mc2NKLXFIVEQyWl8wYnN3MWJfemFaUlVRLUN5Q2F1OHBOZzBhWG1BMlVkV2pRMGVaanZNRmJjazdFMjB0V2o5RlNQblFvZHBqWDE5Z0VzZkVkaHpKd2kyYXhlalFSSktCT1lVcVo5cXNLZWRJSUxUWkR0UFhyZFE0UF83V2VkTU1MdTJpVHAyYWN5MWlzLW5qMDBBbm9vdDNQN0lRaTRwcDRORkFOUDdRRy1jMlM0SzBsSDc1dUxsWUZxeS1XWDlOUHZkWW94UjdFamdUcjVMay1PNkhFbFdiQjJudzdLeUs2SzBMWjNsVXJwMHlUVXltYkRVbHZxZ2lGc093UlVqTjBGMnU5a0FhMUoxeFgxcTFVa1kzYmpzU2pFS2pRenVlZUR6UlVkeHFoUHRNLUFDdV9neFBHRy1VTnlPRFFJa0lrRnNzSHNwZWY4dUlFTWhZbzFwUWEyLTBOTjY3ZlRjUG9leHhMVlZkUW9EWGVuamVpX0s2OTNGSTRzSmRFYTlPYzZMLURsbzhKOVZEM2ZiUjFmQVlibzI1QWtXaExqbC1TQ3BCeHBjTzR6Qk4tVFh2NHp2RHRLS0dUVjdQWERDVkdNVWlJS2ZBM2o2NVkyR1hhYkZndENTVTJIOVFfUHhwWlJhR0Q2ZXBqaWdVNkVraU1hLUsyX2VQXzR3T3RZMDhlUFNZdW5XRmJVZzE5RGJwekV2WFVzTUVsSTAtMGZEV2xHTXhzY2pKT1h3T2cwWGZzQlNSajBQUS5lVndYaGc2UTZzVjNZWXdSbGtwa19n";

describe("token", () => {
  let clock, fakeConfig, token;

  beforeEach(() => {
    fakeConfig = {
      require(key) {
        switch (key) {
          case "token.signingSecret":
            return "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
          case "token.encryptionSecret":
            return "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
        }
      }
    };
    clock = sinon.useFakeTimers(1000);
    token = _token.init(fakeConfig);
  });

  afterEach(() => {
    clock.restore();
  });

  it("can decrypt and validate canvas jwt", async () => {
    const payload = await token.payload(CANVAS_TOKEN);
    assert.equal(payload.iss, "Canvas");
  });

  it("create returns a valid jwt", async () => {
    const jwt = await token.create({ test: "create" });
    const payload = await token.payload(jwt);
    assert.equal(payload.test, "create");
  });

  it("payload returns payload without validating", async () => {
    const jwt = await token.create({ test: "payload", exp: 0 });
    const payload = await token.payload(jwt);
    assert.equal(payload.test, "payload");
  });

  it("verify throws TokenInvalidException if after exp", async () => {
    const jwt = await token.create({ test: "verify", exp: 0 });
    return await token.verify(jwt).catch(error => {
      assert.ok(error instanceof TokenInvalidException);
      assert.equal(error.code, "E_TOKEN_AFTER_EXP");
    });
  });

  it("verify throws TokenInvalidException before nbf", async () => {
    const jwt = await token.create({ test: "verify", nbf: 2 });
    return await token.verify(jwt).catch(error => {
      assert.ok(error instanceof TokenInvalidException);
      assert.equal(error.code, "E_TOKEN_BEFORE_NBF");
    });
  });

  it("very returns payload with valid dates", async () => {
    const jwt = await token.create({ test: "verify", exp: 2 });
    const payload = await token.verify(jwt);
    assert.equal(payload.test, "verify");
  });

  it("wrap returns jws with decoded user token", async () => {
    const decoded = "usertoken";
    const jwt = token._encode(decoded);
    const verified = await token._verify(token._decode(await token.wrap(jwt)));
    const payload = JSON.parse(verified.payload);
    assert.equal(payload.user_token, decoded);
  });
});
