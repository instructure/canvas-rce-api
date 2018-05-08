"use strict";

const { stringify } = require("qs");

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
  let transformedBody = {
    file_ids: [body.fileId],
    publish: true,
    usage_rights: {
      use_justification: body.usageRight,
      legal_copyright: body.copyrightHolder,
      license: body.ccLicense
    }
  };

  // Note: unirest doesn't stringify arrays and sub-objects in the body
  // correctly. Explicitly use the qs module to handle stringifying the js
  // object. Also, use arrayFormat: 'brackets' so arrays are in the format
  // canvas expexts.
  //
  // TODO: We should probably move this js obj => body string logic to
  // canvasProxy.js send(), but it will require testing to ensuer it doesn't
  // break other requests.
  const bodyStr = stringify(transformedBody, { arrayFormat: "brackets" });

  return bodyStr;
}

module.exports = { canvasPath, transformBody };
