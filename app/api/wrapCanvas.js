"use strict";

const canvasProxy = require("./canvasProxy");
const buildUrl = require("./buildUrl");
const sign = require("../utils/sign");
const { RuntimeException } = require("node-exceptions");

// by default just proxies the canvas response status and body
function defaultCanvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  response.send(canvasResponse.body);
}

const DEFAULT_CANVAS_PER_PAGE_ARG = 50;

// by default just returns the body as-is
function defaultTransformBody(body) {
  return body;
}

// uses wrapper to determine canvas request to make, makes the request (with
// appropriate jwt wrapping, request ID forwarding, etc.), and then hands the
// response back to the wrapper. in the case of a token error, hands that to
// the wrapper as well.
function canvasApiCall(wrapper, request, response, options) {
  const wrappedTokenString = request.auth.wrappedToken;
  const canvasResponseHandler =
    wrapper.canvasResponseHandler || defaultCanvasResponseHandler;
  const transformBody = wrapper.transformBody || defaultTransformBody;
  let url = sign.verify(request.query.bookmark);
  if (!url) {
    request.query.per_page =
      request.query.per_page || DEFAULT_CANVAS_PER_PAGE_ARG;
    let domain = request.auth.payload.domain;
    let path = wrapper.canvasPath(request);
    url = buildUrl(domain, path);
  }
  if (options.method == "GET") {
    canvasProxy.fetch(url, request, wrappedTokenString).then(canvasResponse => {
      canvasResponseHandler(request, response, canvasResponse);
    });
  } else if (options.method == "POST" || options.method === "PUT") {
    let transformedBody = transformBody(request.body);
    canvasProxy
      .send(options.method, url, request, wrappedTokenString, transformedBody)
      .then(canvasResponse => {
        canvasResponseHandler(request, response, canvasResponse);
      });
  } else {
    throw new RuntimeException(`Method ${options.method} is not supported`);
  }
}

// curry a wrapper into canvasApiCall to turn it into a route
// requests through it
function wrapCanvas(wrapper, options) {
  options = options || {};
  options.method = options.method || "GET";
  return (request, response, next) => {
    try {
      canvasApiCall(wrapper, request, response, options);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = wrapCanvas;
