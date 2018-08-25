"use strict";

const packageBookmark = require("./packageBookmark");

// creates a function appropriate for use a a canvas wrapper's
// canvasResponseHandler that just translates the canvas response's body
// according to the given function, then returns it as "links" along with a
// packaged bookmark
function linksResponseHandler(linksFromResponseBody) {
  return (request, response, canvasResponse) => {
    if (canvasResponse.statusCode == 200) {
      response.status(200);
      response.send({
        links: linksFromResponseBody(request, canvasResponse.body),
        bookmark: packageBookmark(request, canvasResponse.bookmark)
      });
    } else {
      response.status(canvasResponse.statusCode);
      response.send(canvasResponse.body);
    }
  };
}

module.exports = linksResponseHandler;
