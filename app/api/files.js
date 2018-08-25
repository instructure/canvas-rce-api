"use strict";

const packageBookmark = require("./packageBookmark");
const { fileEmbed } = require("../../shared/mimeClass");

function canvasPath(request) {
  return `/api/v1/folders/${request.params.folderId}/files?per_page=${
    request.query.per_page
  }&include[]=preview_url&use_verifiers=0`;
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const files = canvasResponse.body;
    response.send({
      files: files.map(file => {
        return {
          id: file.id,
          type: file["content-type"],
          name: file.display_name || file.filename,
          url: file.url,
          embed: fileEmbed(file)
        };
      }),
      bookmark: packageBookmark(request, canvasResponse.bookmark)
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
