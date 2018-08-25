"use strict";

function canvasPath(request) {
  const { context_type, context_id } = request.auth.payload;
  switch (context_type) {
    case "Course":
      return `/api/v1/courses/${context_id}/usage_rights`;
    case "Group":
      return `/api/v1/groups/${context_id}/usage_rights`;
    case "User":
      return `/api/v1/users/${context_id}/usage_rights`;
    // TODO handle as 400 Bad Request instead of 500 Internal Server Error
    default:
      throw new Error(`invalid contextType (${context_type})`);
  }
}

function transformBody(body) {
  return {
    file_ids: [body.fileId],
    publish: true,
    usage_rights: {
      use_justification: body.usageRight,
      legal_copyright: body.copyrightHolder,
      license: body.ccLicense
    }
  };
}

module.exports = { canvasPath, transformBody };
