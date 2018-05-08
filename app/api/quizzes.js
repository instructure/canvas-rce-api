"use strict";

const linksResponseHandler = require("./linksResponseHandler");

function canvasPath(request) {
  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/quizzes?per_page=${
        request.query.per_page
      }`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(quiz => {
    return { href: quiz.html_url, title: quiz.title };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
