/*
 * While this is the /api/documents api, it should probably get renamed to something
 * like filesInContext, since it can pull all files in a context filtered by content-type
 * First use is for the documents pane of the content tray for the canvas-rce, but
 * it can be used for images and media files too
 */
"use strict";

const packageBookmark = require("./packageBookmark");
const { getArrayQueryParam } = require("../utils/object");
const { getSearch } = require("../utils/search");
const { optionalQuery } = require("../utils/optionalQuery");

function getContentTypes(query) {
  const list = getArrayQueryParam(query.content_types);
  if (list && list.length) {
    return "&" + list.map((t) => `content_types[]=${t}`).join("&");
  }
  return "";
}

function getNotContentTypes(query) {
  const list = getArrayQueryParam(query.exclude_content_types);
  if (list && list.length) {
    return "&" + list.map((t) => `exclude_content_types[]=${t}`).join("&");
  }
  return "";
}

function getContext(query) {
  switch (query.contextType) {
    case "course":
      return "courses";
    case "group":
      return "groups";
    case "user":
      return "users";
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error("invalid contextType");
  }
}

const validSortFields = [
  "name",
  "size",
  "created_at",
  "updated_at",
  "content_type",
  "user",
];

function getSort(query) {
  if (!query.sort) {
    return "";
  }
  let orderby = query.sort;
  if (!validSortFields.includes(orderby)) {
    throw new Error("invalid sort");
  }
  const order = query.order === "desc" ? "desc" : "asc";
  return `&sort=${orderby}&order=${order}`;
}

function getPreview(query) {
  return query.preview ? `&${query.preview}` : "";
}
function canvasPath(request) {
  let content_types = getContentTypes(request.query);
  let exclude_content_types = getNotContentTypes(request.query);
  let sort = getSort(request.query);
  let search = getSearch(request.query);
  let context = getContext(request.query);
  let preview = getPreview(request.query);
  const category = optionalQuery(request.query, "category");

  return `/api/v1/${context}/${request.query.contextId}/files?per_page=${request.query.per_page}&use_verifiers=0${content_types}${exclude_content_types}${sort}${search}${preview}${category}`;
}

const svg_re = /image\/svg/;
function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const files = canvasResponse.body;
    const transformedFiles = files.map((file) => {
      // svg files come back from canvas without a thumbnail
      // let's use the file's url
      let thumbnail_url = file.thumbnail_url;
      if (!thumbnail_url && svg_re.test(file["content-type"])) {
        thumbnail_url = file.url.replace(/\?.*$/, "");
      }

      return {
        id: file.id,
        filename: file.filename,
        thumbnail_url: thumbnail_url,
        display_name: file.display_name,
        preview_url: file.preview_url,
        href: file.url,
        download_url: file.url,
        content_type: file["content-type"],
        published: !file.locked,
        hidden_to_user: file.hidden,
        locked_for_user: file.locked_for_user,
        unlock_at: file.unlock_at,
        lock_at: file.lock_at,
        date: file.created_at,
        uuid: file.uuid,
        media_entry_id: file.media_entry_id,
      };
    });

    response.send({
      files: transformedFiles,
      bookmark: packageBookmark(request, canvasResponse.bookmark),
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
