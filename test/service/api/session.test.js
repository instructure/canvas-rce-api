"use strict";

const sessionHandler = require("../../../app/api/session");
const sinon = require("sinon");

describe("Session handler", () => {
  it("responsed with expected data from token", () => {
    const req = {
      auth: {
        payload: {
          context_type: "Course",
          context_id: 47,
          workflow_state: {
            can_upload_files: true,
            usage_rights_required: false,
            use_high_contrast: true,
            can_create_pages: false
          },
          domain: "canvas.docker"
        }
      }
    };
    const res = { json: sinon.spy() };
    sessionHandler(req, res);
    sinon.assert.calledWithMatch(res.json, {
      contextType: "Course",
      contextId: 47,
      canUploadFiles: true,
      usageRightsRequired: false,
      useHighContrast: true,
      canCreatePages: false,
      canvasUrl: "http://canvas.docker"
    });
  });
});
