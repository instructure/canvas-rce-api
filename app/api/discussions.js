"use strict";

const linksResponseHandler = require("./linksResponseHandler");
const { getSearch } = require("../utils/search");

function canvasPath(request) {
  const search = getSearch(request.query);

  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/discussion_topics?per_page=${request.query.per_page}&order_by=title${search}`;
    case "group":
      return `/api/v1/groups/${request.query.contextId}/discussion_topics?per_page=${request.query.per_page}&order_by=title${search}`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(discussion => {
    let date = null;
    let date_type = null;
    if (discussion.assignment && discussion.assignment.due_at) {
      date = discussion.assignment.due_at;
      date_type = "due";
    } else {
      date = discussion.todo_date || null;
      date_type = "todo";
    }
    return {
      href: discussion.html_url,
      title: discussion.title,
      published: discussion.published,
      date,
      date_type
    };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
