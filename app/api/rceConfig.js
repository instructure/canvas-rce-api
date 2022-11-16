"use strict";

function canvasPath(request) {
  if (!request.query.contextId)
    throw new Error("missing contextId parameter from query param");

  const queryParamName = (contextType => {
    switch (contextType) {
      case "course":
        return "course_id";
      case "user":
        return "user_id";
      case "group":
        return "group_id";
      case "account":
        return "account_id";
      default:
        throw new Error(`invalid contextType (${request.query.contextType})`);
    }
  })(request.query.contextType);

  return `/api/v1/services/rce_config?${queryParamName}=${request.query.contextId}`;
}

module.exports = { canvasPath };
