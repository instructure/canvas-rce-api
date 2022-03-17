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
  const moid = request.params.mediaObjectId;
  const includes = getIncludes(request.query);
  return `/api/v1/media_objects/${moid}/media_tracks${includes}`;
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
