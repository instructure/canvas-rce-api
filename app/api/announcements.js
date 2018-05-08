"use strict";

const linksResponseHandler = require("./linksResponseHandler");

function canvasPath(request) {
  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${
        request.query.contextId
      }/discussion_topics?per_page=${
        request.query.per_page
      }&only_announcements=1&order_by=title`;
    case "group":
      return `/api/v1/groups/${
        request.query.contextId
      }/discussion_topics?per_page=${
        request.query.per_page
      }&only_announcements=1&order_by=title`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(announcement => {
    return { href: announcement.html_url, title: announcement.title };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
