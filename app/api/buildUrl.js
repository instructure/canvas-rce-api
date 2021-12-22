"use strict";

function buildUrl(domain, path) {
  var protocol = "http";
  if (process.env.HTTP_PROTOCOL_OVERRIDE) {
    protocol = process.env.HTTP_PROTOCOL_OVERRIDE;
  } else if (process.env.NODE_ENV === "production") {
    protocol = "https";
  }
  return protocol + "://" + domain + (path || "");
}

module.exports = buildUrl;
