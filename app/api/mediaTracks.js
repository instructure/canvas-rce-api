"use strict";
const InvalidMediaTrack = require("../exceptions/InvalidMediaTrackException");
const { getArrayQueryParam } = require("../utils/object");

function getIncludes(query) {
  const list = getArrayQueryParam(query.include);
  if (list && list.length) {
    return "?" + list.map(t => `include[]=${t}`).join("&");
  }
  return "";
}

function canvasPath(request) {
  const includes = getIncludes(request.query);
  const moid = request.params.mediaAttachmentId || request.params.mediaObjectId;
  const path = request.params.mediaAttachmentId
    ? "media_attachments"
    : "media_objects";
  return `/api/v1/${path}/${moid}/media_tracks${includes}`;
}

function transformBody(body) {
  if (!Array.isArray(body)) {
    throw InvalidMediaTrack.badFormat();
  }
  const tracks = body.map(t => {
    if (!t.locale) {
      throw InvalidMediaTrack.missingLocale();
    }
    const cc = { locale: t.locale };
    if (t.content) {
      cc.content = t.content;
    }
    return cc;
  });
  return JSON.stringify(tracks);
}

function canvasResponseHandler(request, response, canvasResponse) {
  response.status(canvasResponse.statusCode);
  response.send(canvasResponse.body);
}

module.exports = { canvasPath, canvasResponseHandler, transformBody };
