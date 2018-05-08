"use strict";

const { equal, ok } = require("assert");
const TokenInvalidException = require("../../../app/exceptions/TokenInvalidException");

describe("TokenInvalidException", () => {
  describe("before", () => {
    let err;

    beforeEach(() => {
      err = TokenInvalidException.before();
    });

    it("returns an TokenInvalidException", () => {
      ok(err instanceof TokenInvalidException);
    });

    it("has correct code", () => {
      equal(err.code, "E_TOKEN_BEFORE_NBF");
    });

    it("has a status of 401", () => {
      equal(err.status, 401);
    });
  });

  describe("expired", () => {
    let err;

    beforeEach(() => {
      err = TokenInvalidException.expired();
    });

    it("returns an TokenInvalidException", () => {
      ok(err instanceof TokenInvalidException);
    });

    it("has correct code", () => {
      equal(err.code, "E_TOKEN_AFTER_EXP");
    });

    it("has a status of 401", () => {
      equal(err.status, 401);
    });
  });

  describe("parse", () => {
    let err, originalError;

    beforeEach(() => {
      originalError = new Error("original");
      err = TokenInvalidException.parse(originalError);
    });

    it("returns an TokenInvalidException", () => {
      ok(err instanceof TokenInvalidException);
    });

    it("has correct code", () => {
      equal(err.code, "E_TOKEN_PARSE_ERROR");
    });

    it("has a status of 401", () => {
      equal(err.status, 401);
    });

    it("has reference to originalError", () => {
      equal(err.originalError, originalError);
    });
  });
});
