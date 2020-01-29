/*
 * While this is the /api/documents api, it should probably get renamed to something
 * like filesInContext, since it can pull all files in a context filtered by content-type
 * First use is for the documents pane of the content tray for the canvas-rce, but
 * it can be used for images and media files too
 */
"use strict";

const packageBookmark = require("./packageBookmark");

function getContentTypes(query) {
  const list = query.content_types && query.content_types.split(",");
  if (list && list.length) {
    return "&" + list.map(t => `content_types[]=${t}`).join("&");
  }
  return "";
}

function getNotContentTypes(query) {
  const list =
    query.exclude_content_types && query.exclude_content_types.split(",");
  if (list && list.length) {
    return "&" + list.map(t => `exclude_content_types[]=${t}`).join("&");
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
  "user"
];

function getSort(query) {
  if (!query.sort) {
    return "";
  }
  let orderby = query.sort;
  if (!validSortFields.includes(orderby)) {
    throw new Error("invalid sort");
  }
  return `&sort=${orderby}&order=asc`;
}

function getPreview(query) {
  return query.preview ? `&${query.preview}` : "";
}

function formatFileUrl(contextType, contextId, apiFile) {
  const context = `/${contextType}/${contextId}`;
  return `${context}/files/${apiFile.id}/preview${
    context.includes("user") ? `?verifier=${apiFile.uuid}` : ""
  }`;
}

function canvasPath(request) {
  let content_types = getContentTypes(request.query);
  let exclude_content_types = getNotContentTypes(request.query);
  let sort = getSort(request.query);
  let context = getContext(request.query);
  let preview = getPreview(request.query);

  return `/api/v1/${context}/${request.query.contextId}/files?per_page=${
    request.query.per_page
  }&use_verifiers=0${content_types}${exclude_content_types}${sort}${preview}`;
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  const contextType = getContext(request.query);
  const contextId = request.query.contextId;

  if (canvasResponse.statusCode === 200) {
    const files = canvasResponse.body;
    const transformedFiles = files.map(file => {
      return {
        id: file.id,
        filename: file.filename,
        thumbnail_url: file.thumbnail_url,
        display_name: file.display_name,
        preview_url: file.preview_url,
        href: formatFileUrl(contextType, contextId, file),
        content_type: file["content-type"],
        published: !file.locked,
        hidden_to_user: file.hidden,
        locked_for_user: file.locked_for_user,
        unlock_at: file.unlock_at,
        lock_at: file.lock_at,
        date: file.created_at,
        uuid: file.uuid
      };
    });

    response.send({
      files: transformedFiles,
      bookmark: packageBookmark(request, canvasResponse.bookmark)
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
