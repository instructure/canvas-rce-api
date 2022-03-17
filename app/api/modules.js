"use strict";

const linksResponseHandler = require("./linksResponseHandler");
const { getSearch } = require("../utils/search");

function canvasPath(request) {
  const search = getSearch(request.query);

  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/modules?per_page=${request.query.per_page}${search}`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  // Canvas' API for modules doesn't have an html_url, so we have to construct
  // it ourselves with knowledge of Canvas' internals (boo)
  let prefix = `/courses/${request.query.contextId}/modules/`;
  return results.map(module => {
    return {
      href: prefix + module.id,
      title: module.name,
      published: module.published
    };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
