"use strict";

const querystring = require("querystring");

// package bookmark from canvas to be embedded as a query parameter to the same
// path as the current request, and with all the same query parameters as the
// current request (except replacing any existing bookmark)
function packageBookmark(request, bookmark) {
  if (bookmark) {
    const path = request.baseUrl + request.path;
    const query = Object.assign({}, request.query, { bookmark });
    const qs = querystring.stringify(query);
    return `${request.protocol}://${request.get("Host")}${path}?${qs}`;
  } else {
    return null;
  }
}

module.exports = packageBookmark;
