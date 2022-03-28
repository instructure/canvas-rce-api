"use strict";

const { fileEmbed } = require("../../shared/mimeClass");
const { optionalQuery } = require("../utils/optionalQuery");

function canvasPath(request) {
  return `/api/v1/files/${
    request.params.fileId
  }?include[]=preview_url${optionalQuery(
    request.query,
    "replacement_chain_context_type"
  )}${optionalQuery(request.query, "replacement_chain_context_id")}`;
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
      preview_url: file.preview_url,
      embed: fileEmbed(file),
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
