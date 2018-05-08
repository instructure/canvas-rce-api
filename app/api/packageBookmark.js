"use strict";

const querystring = require("querystring");

// package bookmark from canvas to be embedded as a query parameter to the same
// path as the current request, and with all the same query parameters as the
// current request (except replacing any existing bookmark)
function packageBookmark(request, bookmark) {
  if (bookmark) {
    let path = request.baseUrl + request.path;
    let query = Object.assign({}, request.query, { bookmark });
    let qs = querystring.stringify(query);
    return `${request.protocol}://${request.host}${path}?${qs}`;
  } else {
    return null;
  }
}

module.exports = packageBookmark;
