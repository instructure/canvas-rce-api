"use strict";

function getSessionHandler(req, res) {
  const { workflow_state, context_type, context_id } = req.auth.payload;
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
    canCreatePages: can_create_pages
  });
}

module.exports = getSessionHandler;
