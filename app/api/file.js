"use strict";

const { parse, format } = require("url");
const { fileEmbed } = require("../../shared/mimeClass");
const { optionalQuery } = require("../utils/optionalQuery");

function canvasPath(request) {
  const uri = parse(`/api/v1/files/${request.params.fileId}`);
  let query = {};
  if (request.query.replacement_chain_context_type) {
    query["replacement_chain_context_type"] =
      request.query.replacement_chain_context_type;
  }
  if (request.query.replacement_chain_context_id) {
    query["replacement_chain_context_id"] =
      request.query.replacement_chain_context_id;
  }
  let include = ["preview_url"];
  if (request.query.include) {
    include = include.concat(request.query.include);
  }
  query["include"] = include;
  uri.query = query;
  return format(uri);
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
      restricted_by_master_course: file.restricted_by_master_course,
      is_master_course_child_content: file.is_master_course_child_content,
      is_master_course_master_content: file.is_master_course_master_content
    });
  } else {
    response.send(canvasResponse.body);
  }
}

module.exports = { canvasPath, canvasResponseHandler };
