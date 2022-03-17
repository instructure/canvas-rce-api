"use strict";

const linksResponseHandler = require("./linksResponseHandler");
const { getSearch } = require("../utils/search");

function canvasPath(request) {
  const search = getSearch(request.query);

  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/pages?sort=title&per_page=${request.query.per_page}${search}`;
    case "group":
      return `/api/v1/groups/${request.query.contextId}/pages?sort=title&per_page=${request.query.per_page}${search}`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(wikiPage => {
    return {
      href: wikiPage.html_url,
      title: wikiPage.title,
      published: wikiPage.published,
      date: wikiPage.todo_date || null,
      date_type: "todo"
    };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
