"use strict";

const linksResponseHandler = require("./linksResponseHandler");

function canvasPath(request) {
  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/assignments?per_page=${
        request.query.per_page
      }&order_by=name`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(assignment => {
    return {
      href: assignment.html_url,
      title: assignment.name,
      published: assignment.published,
      date: assignment.has_overrides ? "multiple" : assignment.due_at,
      date_type: "due"
    };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
