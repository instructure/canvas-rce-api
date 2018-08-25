"use strict";

const canvasProxy = require("../../../app/api/canvasProxy");
const dgram = require("dgram");
const assert = require("assert");
const nock = require("nock");
const sinon = require("sinon");
const sign = require("../../../app/utils/sign");

describe("Canvas Proxy", () => {
  let httpStub;
  let token = "token";
  let request;
  let reqId = "1234-5678-9012-3456";
  let encodedReqId = new Buffer(reqId).toString("base64");
  let idSignature =
    "18cGMHRzi2nQG6Fg1ye+X8VC7Pk0x5njI9hEdhwwcKLKcFhoFNjYmo4i+hFiMdkh21pLLmuMc7AYUVk9NDKSfQ==";
  let host = "some.instructure.com";
  let path = "/api/v1/some/path";
  let url = `http://${host}${path}`;
  let statsServer = null;

  before(() => {
    request = { id: reqId, get: () => "Special Agent" };
    statsServer = dgram.createSocket("udp4");
    statsServer.on("error", err => {
      // eslint-disable-next-line no-console
      console.log(`STATS SERVER error:\n${err.stack}`);
      statsServer.close();
    });
    statsServer.bind(process.env.STATSD_PORT);
  });

  after(() => {
    statsServer.close();
  });

  beforeEach(() => {
    process.env.ECOSYSTEM_SECRET = "testsecret";
    httpStub = nock("http://" + host);
  });

  describe("fetch", () => {
    it("requests from given url", () => {
      var scope = httpStub.get(path).reply(200);
      return canvasProxy.fetch(url, request, token).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("passes the response back through to the caller", () => {
      httpStub.get(path).reply(200, { some: "data" });
      return canvasProxy.fetch(url, request, token).then(response => {
        assert.equal(response.body.some, "data");
      });
    });

    it("passes the token along in the auth header", () => {
      var scope = httpStub
        .matchHeader("Authorization", "Bearer token")
        .get(path)
        .reply(200);

      return canvasProxy.fetch(url, request, token).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("provides the request ID in the context id header", () => {
      let scope = httpStub
        .matchHeader("X-Request-Context-Id", encodedReqId)
        .get(path)
        .reply(200);

      return canvasProxy.fetch(url, request, token).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("signs the request id to confirm origin", () => {
      let scope = httpStub
        .matchHeader("X-Request-Context-Signature", idSignature)
        .get(path)
        .reply(200);

      return canvasProxy.fetch(url, request, token).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("passes the request user agent through", () => {
      let scope = httpStub
        .matchHeader("User-Agent", "Special Agent")
        .get(path)
        .reply(200);

      return canvasProxy.fetch(url, request, token).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("writes stats to track canvas time", done => {
      let finished = false;
      statsServer.on("message", msg => {
        if (finished == false) {
          let statRegex = /cg\.rich-content-service\.development\.request\.canvas:\d\|ms/;
          assert.ok(statRegex.test(msg.toString()));
          finished = true;
          done();
        }
      });
      httpStub.get(path).reply(200);
      canvasProxy.fetch(url, request, token);
    });

    describe("bookmark extraction", () => {
      const bookmark = "bookmarkValue";

      it("signs bookmark from link header and includes in response", () => {
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
        return canvasProxy.fetch(url, request, token).then(response => {
          assert.equal(response.bookmark, signed);
          mock.verify();
        });
      });

      it('only cares about the rel="next" link in the header', () => {
        httpStub
          .get(path)
          .reply(200, { some: "data" }, { Link: `<${bookmark}>; rel="prev"` });
        return canvasProxy.fetch(url, request, token).then(response => {
          assert.equal(response.bookmark, undefined);
        });
      });

      it("skips if there is no Link header", () => {
        httpStub.get(path).reply(200, { some: "data" });
        return canvasProxy.fetch(url, request, token).then(response => {
          assert.equal(response.bookmark, undefined);
        });
      });
    });
  });

  describe("send", () => {
    let postBody = { a: 1, b: [2, 3] };

    it("hits the given url with the body for a post", () => {
      var scope = httpStub.post(path, postBody).reply(200, "{}");
      return canvasProxy
        .send("POST", url, request, token, postBody)
        .then(() => {
          assert.ok(scope.isDone());
        });
    });

    it("hits the given url with the body for a put", () => {
      var scope = httpStub.put(path, postBody).reply(200, "{}");
      return canvasProxy.send("PUT", url, request, token, postBody).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("passes the token and request id along in the headers", () => {
      var scope = httpStub
        .matchHeader("Authorization", "Bearer token")
        .matchHeader("X-Request-Context-Id", encodedReqId)
        .matchHeader("X-Request-Context-Signature", idSignature)
        .post(path)
        .reply(200, "{}");

      return canvasProxy.send("POST", url, request, token).then(() => {
        assert.ok(scope.isDone());
      });
    });

    it("writes a stats key for posts", done => {
      let finished = false;
      statsServer.on("message", msg => {
        if (finished == false) {
          let statRegex = /cg\.rich-content-service\.development\.request\.canvas:\d\|ms/;
          assert.ok(statRegex.test(msg.toString()));
          finished = true;
          done();
        }
      });
      httpStub.post(path, postBody).reply(200, "{}");
      canvasProxy.send("POST", url, request, token, postBody);
    });
  });
});
