"use strict";

/**
 * NOTE: the new RCE in canvas now uses the /documents?context_types=image
 * endpoint to query for images rather than this /images endpoint
 */

const packageBookmark = require("./packageBookmark");
const { getSearch } = require("../utils/search");

function canvasPath(request) {
  switch (request.query.contextType) {
    case "course":
      return `/api/v1/courses/${request.query.contextId}/files?per_page=${request.query.per_page}&content_types[]=image&use_verifiers=0`;
    case "group":
      return `/api/v1/groups/${request.query.contextId}/files?per_page=${request.query.per_page}&content_types[]=image&use_verifiers=0`;
    case "user":
      return `/api/v1/users/${request.query.contextId}/files?per_page=${request.query.per_page}&content_types[]=image&use_verifiers=0`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error("invalid contextType");
  }
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const images = canvasResponse.body;
    const transformedImages = images.map(image => {
      return {
        id: image.id,
        filename: image.filename,
        thumbnail_url: image.thumbnail_url,
        display_name: image.display_name,
        preview_url: image.url,
        href: image.url
      };
    });

    response.send({
      images: transformedImages,
      bookmark: packageBookmark(request, canvasResponse.bookmark)
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
