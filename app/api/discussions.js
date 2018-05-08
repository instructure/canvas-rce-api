"use strict";

const linksResponseHandler = require("./linksResponseHandler");

function canvasPath(request) {
  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${
        request.query.contextId
      }/discussion_topics?per_page=${request.query.per_page}&order_by=title`;
    case "group":
      return `/api/v1/groups/${
        request.query.contextId
      }/discussion_topics?per_page=${request.query.per_page}&order_by=title`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(discussion => {
    return { href: discussion.html_url, title: discussion.title };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
