"use strict";

const cors = require("cors");

function validateOrigin(origin, callback) {
  // right now the only thing we expose is a javascript file, which
  // is the same sort of asset as on the CDN.  Because of vanity domains,
  // it's not worth putting in an intelligent domain whitelist.
  // Therefore, we won't block anyone loading the module due to cors.  If
  //  we ever expose something more sensitive, then we'll make a whitelist
  // that checks with canvas and rejects unapproved domains.
  //
  //  Should that day come to pass, use the body of this funciton to figure
  // out whether the "origin" variable is a valid domain.  if it is, callback
  // with (null, true), otherwise callback with (null, false)
  callback(null, true);
}

function applyToApp(app) {
  var corsMiddleware = cors({
    origin: validateOrigin
  });
  app.use(corsMiddleware);
}

module.exports = { applyToApp, validateOrigin };
