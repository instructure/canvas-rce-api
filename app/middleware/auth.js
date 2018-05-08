"use strict";

const _token = require("../token");
const AuthRequiredException = require("../exceptions/AuthRequiredException");

function bearerToken(authorization) {
  const matches = /^Bearer\s(.+)/.exec(authorization);
  if (matches && matches[1]) {
    return matches[1];
  }
  return null;
}

function inject() {
  return [_token];
}

function init(token) {
  return async (req, res, next) => {
    try {
      const jwt = bearerToken(req.get("Authorization"));
      if (jwt == null) {
        throw AuthRequiredException.tokenMissing();
      }
      req.auth = {
        token: jwt,
        payload: await token.verify(jwt),
        wrappedToken: await token.wrap(jwt)
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { inject, init, singleton: true };
