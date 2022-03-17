"use strict";

const assert = require("assert");
const nock = require("nock");
const wrapCanvas = require("../../../app/api/wrapCanvas");
const sign = require("../../../app/utils/sign");
const { RuntimeException } = require("node-exceptions");

describe("wrapping a Canvas request/response", function() {
  const domain = "test.canvas.local";
  const schemaAndHost = `http://${domain}`;
  const defaultPath = "/canvasPath";

  function mockRequest(payload, wrappedToken) {
    return {
      query: {},
      id: "request-id",
      auth: { payload, wrappedToken },
      get: () => null
    };
  }

  function buildWrapper(overrides) {
    return Object.assign(
      {},
      {
        canvasPath() {
          return defaultPath;
        }
      },
      overrides
    );
  }

  let tokenPayload, response, request, wrappedToken;

  beforeEach(() => {
    tokenPayload = { domain };
    wrappedToken = "goodwrapped";
    request = mockRequest(tokenPayload, wrappedToken);
    response = {
      status: () => {},
      send: () => {}
    };
  });

  it("uses the wrapper's path and token's domain for fetch", done => {
    const scope = nock(schemaAndHost)
      .get(defaultPath)
      .reply(200, "success");
    wrapCanvas(
      buildWrapper({
        canvasResponseHandler() {
          assert.ok(scope.isDone());
          done();
        }
      })
    )(request, response);
  });

  it("overrides wrapper path and token domain with the request's bookmark if given", done => {
    request.query.bookmark = sign.sign("http://otherHost/bookmark");
    const scope = nock("http://otherHost")
      .get("/bookmark")
      .reply(200, "success");
    wrapCanvas(
      buildWrapper({
        canvasResponseHandler() {
          assert.ok(scope.isDone());
          done();
        }
      })
    )(request, response);
  });

  it("passes request, response, and canvas response to wrapper's response handler", done => {
    nock(schemaAndHost)
      .get(defaultPath)
      .reply(200, "success");
    wrapCanvas(
      buildWrapper({
        canvasResponseHandler(req, resp1, resp2) {
          assert.strictEqual(req, request);
          assert.strictEqual(resp1, response);
          assert.strictEqual(resp2.statusCode, 200);
          assert.strictEqual(resp2.body, "success");
          done();
        }
      })
    )(request, response);
  });

  it("posts with a body transformation when method specified", done => {
    const scope = nock(schemaAndHost)
      .post(defaultPath)
      .reply(200, "{}");
    let wrapper = buildWrapper({
      transformBody() {
        return JSON.stringify({ post: "body" });
      },

      canvasResponseHandler() {
        assert.ok(scope.isDone());
        done();
      }
    });
    wrapCanvas(wrapper, { method: "POST" })(request, response);
  });

  it("puts with a body transformation when method specified", done => {
    const scope = nock(schemaAndHost)
      .put(defaultPath)
      .reply(200, "{}");
    let wrapper = buildWrapper({
      transformBody() {
        return JSON.stringify({ put: "body" });
      },
      canvasResponseHandler() {
        assert.ok(scope.isDone());
        done();
      }
    });
    wrapCanvas(wrapper, { method: "PUT" })(request, response);
  });

  it("throws RuntimeException for an unrecognized method type", done => {
    nock(schemaAndHost)
      .get(defaultPath)
      .reply(200, "success");
    let wrapper = buildWrapper({
      canvasResponseHandler() {}
    });
    wrapCanvas(wrapper, { method: "FOO" })(request, response, err => {
      try {
        assert.ok(err instanceof RuntimeException);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
