"use strict";

const crypto = require("crypto");
const parseLinkHeader = require("parse-link-header");
const sign = require("../utils/sign");
const { parseFetchResponse } = require("../utils/fetch");

function signatureFor(string_to_sign) {
  const shared_secret = process.env.ECOSYSTEM_SECRET;
  const hmac = crypto.createHmac("sha512", shared_secret);
  hmac.write(string_to_sign);
  hmac.end();
  const hmacString = hmac.read();
  return Buffer.from(hmacString).toString("base64");
}

function requestHeaders(tokenString, req) {
  const reqIdSignature = signatureFor(req.id);
  return {
    Authorization: "Bearer " + tokenString,
    "User-Agent": req.get("User-Agent"),
    "X-Request-Context-Id": Buffer.from(req.id).toString("base64"),
    "X-Request-Context-Signature": reqIdSignature,
    Accept: "application/json+canvas-string-ids"
  };
}

// looks for a Link header. if there is one, looks for a rel="next" link in it.
// if there is one, pulls it's value out and sticks it into response.bookmark
function parseBookmark(response) {
  // request downcases all headers
  const header = response.headers.link;
  if (header) {
    const links = parseLinkHeader(header[0]);
    if (links.next) {
      response.bookmark = sign.sign(links.next.url);
    }
  }
  return response;
}

function collectStats(req, promiseToTime) {
  const startTime = Date.now();
  return promiseToTime().then(result => {
    req.timers = req.timers || {};
    req.timers.canvas_time = Date.now() - startTime;
    return result;
  });
}

function catchStatusCodeError(err) {
  if (err.name === "StatusCodeError") {
    return err.response;
  }
  throw err;
}

function fetch(url, req, tokenString) {
  return collectStats(req, () =>
    global
      .fetch(url, {
        headers: requestHeaders(tokenString, req)
      })
      .then(parseFetchResponse)
      .then(parseBookmark)
      .catch(catchStatusCodeError)
  );
}

function send(method, url, req, tokenString, body) {
  return collectStats(req, () =>
    global
      .fetch(url, {
        method,
        headers: {
          ...requestHeaders(tokenString, req),
          "Content-Type": "application/json"
        },
        body: typeof body === "string" ? body : JSON.stringify(body)
      })
      .then(parseFetchResponse)
      .catch(catchStatusCodeError)
  );
}

module.exports = { fetch, send };
