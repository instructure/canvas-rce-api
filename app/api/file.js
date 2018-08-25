"use strict";

const { fileEmbed } = require("../../shared/mimeClass");

function canvasPath(request) {
  return `/api/v1/files/${request.params.fileId}`;
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  if (canvasResponse.statusCode === 200) {
    const file = canvasResponse.body;
    response.send({
      id: file.id,
      type: file["content-type"],
      name: file.display_name || file.filename,
      url: file.url,
      embed: fileEmbed(file)
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
