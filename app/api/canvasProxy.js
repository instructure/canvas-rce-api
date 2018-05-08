"use strict";

const unirest = require("unirest");
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

function requestHeaders(tokenString, request) {
  const reqIdSignature = signatureFor(request.id);
  return {
    Authorization: "Bearer " + tokenString,
    "User-Agent": request.get("User-Agent"),
    "X-Request-Context-Id": new Buffer(request.id).toString("base64"),
    "X-Request-Context-Signature": reqIdSignature
  };
}

// looks for a Link header. if there is one, looks for a rel="next" link in it.
// if there is one, pulls it's value out and sticks it into response.bookmark
function parseBookmark(response) {
  // unirest downcases all headers
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

function fetch(url, request, tokenString) {
  const headers = requestHeaders(tokenString, request);
  return collectStats(() => {
    return new Promise(resolve => {
      unirest
        .get(url)
        .headers(headers)
        .end(resolve);
    });
  }).then(parseBookmark);
}

function send(method, url, request, tokenString, body) {
  const headers = requestHeaders(tokenString, request);
  return collectStats(() => {
    return new Promise(resolve => {
      unirest[method.toLowerCase()](url)
        .headers(headers)
        .send(body)
        .end(resolve);
    });
  });
}

module.exports = { fetch, send };
