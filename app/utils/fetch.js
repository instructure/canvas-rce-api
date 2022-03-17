"use strict";

// Translates a fetch-style response into a request-style
// response that the proxied routes expect. Specifically,
// we need to be able to read the body and the headers from
// the same object, which fetch doesn't support by default.
function parseFetchResponse(res) {
  return res
    .text()
    .then(text => {
      // Try to parse response body as JSON, if it wasn't JSON
      // then default to text representation (including blank).
      try {
        return JSON.parse(text);
      } catch (err) {
        return text;
      }
    })
    .then(data => ({
      body: data,
      headers: res.headers.raw(),
      statusCode: res.status
    }));
}

module.exports = { parseFetchResponse };
