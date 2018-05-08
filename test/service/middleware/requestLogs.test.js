"use strict";

const reqLogs = require("../../../app/middleware/requestLogs");
const assert = require("assert");

describe("requestLogging", function() {
  it("puts the request id at the front of the logs", done => {
    let stream = {
      data: [],
      write: stuff => {
        stream.data.push(stuff);
      }
    };
    let middleware = reqLogs.middleware(stream, true);
    let req = {
      headers: {},
      method: "GET",
      path: "/my/api/call",
      id: "1234567890"
    };
    let resp = {};
    middleware(req, resp, function() {
      assert.ok(/^\[1234567890/.test(stream.data[0]));
      done();
    });
  });
});
