"use strict";

const linksResponseHandler = require("./linksResponseHandler");
const { getSearch } = require("../utils/search");

function canvasPath(request) {
  const search = getSearch(request.query);

  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/discussion_topics?per_page=${request.query.per_page}&only_announcements=1&order_by=title${search}`;
    case "group":
      return `/api/v1/groups/${request.query.contextId}/discussion_topics?per_page=${request.query.per_page}&only_announcements=1&order_by=title${search}`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

const canvasResponseHandler = linksResponseHandler((request, results) => {
  return results.map(announcement => {
    let date = announcement.posted_at;
    let date_type = "posted";
    // posted_at date is created_at date until delayed post actually posts
    if (announcement.delayed_post_at > date) {
      date = announcement.delayed_post_at;
      date_type = "delayed_post";
    }
    return {
      href: announcement.html_url,
      title: announcement.title,
      date,
      date_type
    };
  });
});

module.exports = { canvasPath, canvasResponseHandler };
