"use strict";

const linksResponseHandler = require("./linksResponseHandler");
const { getSearch } = require("../utils/search");

function canvasPath(request) {
  const search = getSearch(request.query);

  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/all_quizzes?per_page=${request.query.per_page}${search}`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(quiz => {
    let date = quiz.due_at;
    if (quiz.all_dates && quiz.all_dates.length > 1) {
      date = "multiple";
    }
    return {
      href: quiz.html_url,
      title: quiz.title,
      published: quiz.published,
      date,
      date_type: "due",
      quiz_type: quiz.quiz_type
    };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
