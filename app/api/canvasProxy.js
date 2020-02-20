"use strict";

const request = require("request-promise-native");
const crypto = require("crypto");
const parseLinkHeader = require("parse-link-header");
const sign = require("../utils/sign");

function signatureFor(string_to_sign) {
  const shared_secret = process.env.ECOSYSTEM_SECRET;
  const hmac = crypto.createHmac("sha512", shared_secret);
  hmac.write(string_to_sign);
  hmac.end();
  const hmacString = hmac.read();
  return new Buffer(hmacString).toString("base64");
}

function requestHeaders(tokenString, req) {
  const reqIdSignature = signatureFor(req.id);
  return {
    Authorization: "Bearer " + tokenString,
    "User-Agent": req.get("User-Agent"),
    "X-Request-Context-Id": new Buffer(req.id).toString("base64"),
    "X-Request-Context-Signature": reqIdSignature
  };
}

// looks for a Link header. if there is one, looks for a rel="next" link in it.
// if there is one, pulls it's value out and sticks it into response.bookmark
function parseBookmark(response) {
  // request downcases all headers
  const header = response.headers.link;
  if (header) {
    const links = parseLinkHeader(header);
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
  const headers = requestHeaders(tokenString, req);
  return collectStats(req, () =>
    request({
      url,
      headers,
      resolveWithFullResponse: true,
      json: true
    })
  )
    .catch(catchStatusCodeError)
    .then(parseBookmark);
}

function send(method, url, req, tokenString, body) {
  const headers = requestHeaders(tokenString, req);
  return collectStats(req, () => {
    const params = {
      method,
      url,
      headers,
      qsStringifyOptions: { arrayFormat: "brackets" },
      resolveWithFullResponse: true
    };
    if (typeof body === "string") {
      params.body = body;
    } else {
      params.form = body;
    }
    return request(params);
  })
    .catch(catchStatusCodeError)
    .then(response => {
      response.body = JSON.parse(response.body);
      return response;
    });
}

module.exports = { fetch, send };
