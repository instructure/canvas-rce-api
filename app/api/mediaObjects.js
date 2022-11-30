"use strict";

const packageBookmark = require("./packageBookmark");
const { getSearch } = require("../utils/search");

// to limit the results to media_objects associated with a course
// the api includes contextType and contextId query_string parameters.
function getContext(query) {
  switch (query.contextType) {
    case "course":
    case "courses":
      return "course";
    case "group":
    case "groups":
      return "group";
    case "user":
    case "users":
      return "";
    default:
      throw new Error(`invalid contextType ${query.contextType}`);
  }
}

const validSortFields = ["title", "date"];
const validSortDirs = ["asc", "desc"];
const validContextTypes = ["course", "user", "group"];

function getSort(query) {
  if (!query.sort) {
    return "";
  }
  let orderby = query.sort;
  if (!validSortFields.includes(orderby)) {
    throw new Error("invalid sort");
  }
  if (orderby === "date") {
    orderby = "created_at";
  }
  return `&sort=${orderby}${getSortDir(query)}`;
}

function getSortDir(query) {
  if (!query.order) {
    return "asc";
  }

  const dir = query.order;
  if (!validSortDirs.includes(dir)) {
    throw new Error("invalid sort order");
  }

  return `&order=${dir}`;
}

function canvasPath(request) {
  switch (request.method) {
    case "GET":
      return canvasPathGET(request);
    case "PUT":
      return canvasPathPUT(request);
    case "POST":
      return canvasPathPOST(request);
    default:
      throw new Error("invalid request");
  }
}

function canvasPathGET(request) {
  const contextType = request.query.contextType && getContext(request.query);
  const contextId = request.query.contextId;

  const exclude = "&exclude[]=sources&exclude[]=tracks";
  const sort = getSort(request.query);
  const search = getSearch(request.query);
  let baseURI = "/api/v1/media_objects";

  if (contextType) {
    if (!validContextTypes.includes(contextType)) {
      throw new Error("Invalid contextType");
    }
    if (!contextId) {
      throw new Error("A contextId is required if contextType is provided");
    }
    if (contextType === "course") {
      baseURI = `/api/v1/courses/${contextId}/media_objects`;
    } else if (contextType === "group") {
      baseURI = `/api/v1/groups/${contextId}/media_objects`;
    }
  }

  return `${baseURI}?per_page=${request.query.per_page}&use_verifiers=0${exclude}${sort}${search}`;
}

function canvasPathPOST() {
  return "/api/v1/media_objects";
}

function canvasPathPUT(request) {
  const moid = request.params.mediaObjectId;
  const user_entered_title = request.query.user_entered_title;

  return `/api/v1/media_objects/${moid}?user_entered_title=${encodeURIComponent(
    user_entered_title
  )}`;
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const mediaObjs = canvasResponse.body;
    if (Array.isArray(mediaObjs)) {
      const transformedObjs = mediaObjs.map(obj => {
        return transformMediaObject(obj);
      });

      response.send({
        files: transformedObjs,
        bookmark: packageBookmark(request, canvasResponse.bookmark)
      });
    } else {
      const mediaObj = transformMediaObject(mediaObjs);
      response.send(mediaObj);
    }
  } else {
    response.send(canvasResponse.body);
  }
}

function transformMediaObject(obj) {
  return {
    id: obj.media_id,
    title: obj.user_entered_title || obj.title,
    content_type: obj.media_type,
    media_object: obj.media_object,
    date: obj.created_at,
    published: true, // TODO: is this true?
    embedded_iframe_url: obj.embedded_iframe_url
  };
}
module.exports = { canvasPath, canvasResponseHandler };
