"use strict";

const assert = require("assert");
const AuthRequiredException = require("../../../app/exceptions/AuthRequiredException");
const _auth = require("../../../app/middleware/auth");

describe("auth middleware", () => {
  let auth, jwt, payload, wrapped, req, token;

  beforeEach(() => {
    jwt = "jwt";
    req = { get: h => h === "Authorization" && `Bearer ${jwt}` };
    payload = "payload";
    wrapped = "wrapped";
    token = {
      verify: async j => j === jwt && payload,
      wrap: async j => j === jwt && wrapped
    };
    auth = _auth.init(token);
  });

  it("calls next with AuthRequiredException if missing", async () => {
    req.get = () => null;
    await auth(req, {}, err => {
      assert.ok(err instanceof AuthRequiredException);
      assert.equal(err.status, 401);
    });
  });

  it("adds auth info to request", async () => {
    await auth(req, {}, () => {
      assert.equal(req.auth.token, jwt);
      assert.equal(req.auth.payload, payload);
      assert.equal(req.auth.wrappedToken, wrapped);
    });
  });

  it("calls next with exceptions thrown by token.verify", async () => {
    const verifyErr = {};
    token.verify = () => {
      throw verifyErr;
    };
    await auth(req, {}, err => {
      assert.equal(err, verifyErr);
    });
  });
});
