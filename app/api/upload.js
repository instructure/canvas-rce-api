"use strict";

function canvasPath(request) {
  switch (request.body.contextType) {
    case "course":
      return `/api/v1/courses/${request.body.contextId}/files`;
    case "group":
      return `/api/v1/groups/${request.body.contextId}/files`;
    case "user":
      return `/api/v1/users/${request.body.contextId}/files`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${request.query.contextType})`);
  }
}

function transformBody(body) {
  let canvasUploadPreflightBody = {
    name: body.file.name,
    size: body.file.size,
    contentType: body.file.type || body.file.contentType || undefined,
    parent_folder_id: body.file.parentFolderId,
    on_duplicate: body.onDuplicate || "rename",
    success_include: ["preview_url"],
    category: body.category || undefined,
  };

  return canvasUploadPreflightBody;
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  response.send(canvasResponse.body);
}

module.exports = { canvasPath, transformBody, canvasResponseHandler };
