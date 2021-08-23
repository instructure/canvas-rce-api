"use strict";

const packageBookmark = require("./packageBookmark");
const { fileEmbed } = require("../../shared/mimeClass");
const { getSearch } = require("../utils/search");
const { getSort } = require("../utils/sort");

function canvasPath(request) {
  if (request.query.contextType === "user") {
    return `/api/v1/users/${request.query.contextId}/files?per_page=${
      request.query.per_page
    }&include[]=preview_url&use_verifiers=0${getSearch(request.query)}`;
  } else {
    return `/api/v1/folders/${request.params.folderId}/files?per_page=${
      request.query.per_page
    }&include[]=preview_url&use_verifiers=0${getSearch(request.query)}${getSort(
      request.query
    )}`;
  }
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const files = canvasResponse.body;
    response.send({
      files: files.map(file => {
        return {
          createdAt: file.created_at,
          id: file.id,
          uuid: file.uuid,
          type: file["content-type"],
          name: file.display_name || file.filename,
          url: file.url,
          embed: fileEmbed(file),
          folderId: file.folder_id,
          iframeUrl: file.embedded_iframe_url,
          thumbnailUrl: file.thumbnail_url
        };
      }),
      bookmark: packageBookmark(request, canvasResponse.bookmark)
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
