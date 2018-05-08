"use strict";

const linksResponseHandler = require("./linksResponseHandler");

function canvasPath(request) {
  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${
        request.query.contextId
      }/pages?sort=title&per_page=${request.query.per_page}`;
    case "group":
      return `/api/v1/groups/${
        request.query.contextId
      }/pages?sort=title&per_page=${request.query.per_page}`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(wikiPage => {
    return { href: wikiPage.html_url, title: wikiPage.title };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
