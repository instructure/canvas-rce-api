"use strict";

const buildUrl = require("./buildUrl");

function getSessionHandler(req, res) {
  const { workflow_state, context_type, context_id, domain } = req.auth.payload;

  const {
    can_upload_files,
    usage_rights_required,
    use_high_contrast,
    can_create_pages
  } = workflow_state;

  res.json({
    contextType: context_type,
    contextId: context_id,
    canUploadFiles: can_upload_files,
    usageRightsRequired: usage_rights_required,
    useHighContrast: use_high_contrast,
    canCreatePages: can_create_pages,
    canvasUrl: buildUrl(domain)
  });
}

module.exports = getSessionHandler;
