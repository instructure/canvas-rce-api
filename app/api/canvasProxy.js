"use strict";

const request = require("request-promise-native");
const crypto = require("crypto");
const parseLinkHeader = require("parse-link-header");
const sign = require("../utils/sign");
const statsdClient = require("../middleware/statsLogging");

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

function collectStats(promiseToTime) {
  const startTime = new Date().getTime();
  return promiseToTime().then(result => {
    const endTime = new Date().getTime();
    statsdClient.recordTiming(["canvas"], startTime, endTime);
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
  return collectStats(() =>
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
  return collectStats(() =>
    request({
      method,
      url,
      headers,
      form: body,
      qsStringifyOptions: { arrayFormat: "brackets" },
      resolveWithFullResponse: true
    })
  )
    .catch(catchStatusCodeError)
    .then(response => {
      response.body = JSON.parse(response.body);
      return response;
    });
}

module.exports = { fetch, send };
