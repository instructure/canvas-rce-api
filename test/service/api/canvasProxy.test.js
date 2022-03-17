"use strict";

const canvasProxy = require("../../../app/api/canvasProxy");
const assert = require("assert");
const nock = require("nock");
const sinon = require("sinon");
const sign = require("../../../app/utils/sign");

describe("Canvas Proxy", () => {
  let httpStub;
  let token = "token";
  let request;
  let reqId = "1234-5678-9012-3456";
  let encodedReqId = Buffer.from(reqId).toString("base64");
  let idSignature =
    "18cGMHRzi2nQG6Fg1ye+X8VC7Pk0x5njI9hEdhwwcKLKcFhoFNjYmo4i+hFiMdkh21pLLmuMc7AYUVk9NDKSfQ==";
  let host = "some.instructure.com";
  let path = "/api/v1/some/path";
  let url = `http://${host}${path}`;

  before(() => {
    request = { id: reqId, get: () => "Special Agent" };
  });

  beforeEach(() => {
    process.env.ECOSYSTEM_SECRET = "testsecret";
    httpStub = nock("http://" + host);
  });

  describe("fetch", () => {
    it("requests from given url", async () => {
      var scope = httpStub.get(path).reply(200);
      await canvasProxy.fetch(url, request, token);
      assert.ok(scope.isDone());
    });

    it("passes the response back through to the caller", async () => {
      httpStub.get(path).reply(200, { some: "data" });
      const response = await canvasProxy.fetch(url, request, token);
      assert.strictEqual(response.body.some, "data");
    });

    it("passes the token along in the auth header", async () => {
      var scope = httpStub
        .matchHeader("Authorization", "Bearer token")
        .get(path)
        .reply(200);

      await canvasProxy.fetch(url, request, token);
      assert.ok(scope.isDone());
    });

    it("provides the request ID in the context id header", async () => {
      let scope = httpStub
        .matchHeader("X-Request-Context-Id", encodedReqId)
        .get(path)
        .reply(200);

      await canvasProxy.fetch(url, request, token);
      assert.ok(scope.isDone());
    });

    it("signs the request id to confirm origin", async () => {
      let scope = httpStub
        .matchHeader("X-Request-Context-Signature", idSignature)
        .get(path)
        .reply(200);

      await canvasProxy.fetch(url, request, token);
      assert.ok(scope.isDone());
    });

    it("passes the request user agent through", async () => {
      let scope = httpStub
        .matchHeader("User-Agent", "Special Agent")
        .get(path)
        .reply(200);

      await canvasProxy.fetch(url, request, token);
      assert.ok(scope.isDone());
    });

    it("writes stats to track canvas time", async () => {
      httpStub.get(path).reply(200);
      await canvasProxy.fetch(url, request, token);
      assert("canvas_time" in request.timers);
    });

    describe("bookmark extraction", () => {
      const bookmark = "bookmarkValue";

      it("signs bookmark from link header and includes in response", async () => {
        const mock = sinon.mock(sign);
        const signed = "signed";
        mock
          .expects("sign")
          .once()
          .withExactArgs(bookmark)
          .returns(signed);
        httpStub
          .get(path)
          .reply(200, { some: "data" }, { Link: `<${bookmark}>; rel="next"` });
        const response = await canvasProxy.fetch(url, request, token);
        assert.strictEqual(response.bookmark, signed);
        mock.verify();
      });

      it('only cares about the rel="next" link in the header', async () => {
        httpStub
          .get(path)
          .reply(200, { some: "data" }, { Link: `<${bookmark}>; rel="prev"` });
        const response = await canvasProxy.fetch(url, request, token);
        assert.strictEqual(response.bookmark, undefined);
      });

      it("skips if there is no Link header", async () => {
        httpStub.get(path).reply(200, { some: "data" });
        const response = await canvasProxy.fetch(url, request, token);
        assert.strictEqual(response.bookmark, undefined);
      });
    });
  });

  describe("send", () => {
    it("hits the given url with the string body for a post", async () => {
      const postBody = "this is a string";
      var scope = httpStub.post(path, postBody).reply(200, "{}");
      await canvasProxy.send("POST", url, request, token, postBody);
      assert.ok(scope.isDone());
    });

    it("hits the given url with the string body for a put", async () => {
      const postBody = "this is a string";
      var scope = httpStub.put(path, postBody).reply(200, "{}");
      await canvasProxy.send("PUT", url, request, token, postBody);
      assert.ok(scope.isDone());
    });
    it("hits the given url with the object body for a post", async () => {
      const postBody = { foo: 1, bar: 2 };
      var scope = httpStub.post(path, postBody).reply(200, "{}");
      await canvasProxy.send("POST", url, request, token, postBody);
      assert.ok(scope.isDone());
    });

    it("hits the given url with the body for a put", async () => {
      const postBody = { foo: 1, bar: 2 };
      var scope = httpStub.put(path, postBody).reply(200, "{}");
      await canvasProxy.send("PUT", url, request, token, postBody);
      assert.ok(scope.isDone());
    });

    it("passes the token and request id along in the headers", async () => {
      var scope = httpStub
        .matchHeader("Authorization", "Bearer token")
        .matchHeader("X-Request-Context-Id", encodedReqId)
        .matchHeader("X-Request-Context-Signature", idSignature)
        .post(path)
        .reply(200, "{}");

      await canvasProxy.send("POST", url, request, token);
      assert.ok(scope.isDone());
    });

    it("writes a stats key for posts", async () => {
      const postBody = "post body";
      httpStub.post(path, postBody).reply(200, "{}");
      await canvasProxy.send("POST", url, request, token, postBody);
      assert("canvas_time" in request.timers);
    });
  });
});
