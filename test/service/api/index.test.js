"use strict";

const inja = require("inja");
const _api = require("../../../app/api");
const _config = require("../../../app/config");
const _token = require("../../../app/token");
const assert = require("assert");
const express = require("express");
const request = require("supertest");
const moment = require("moment");
const nock = require("nock");
const addRequestId = require("express-request-id")();

describe("api proxying", function() {
  let container, tokenPayload, tokenString, token;

  function getProxied(path, tokenString) {
    const app = express();

    app.use(addRequestId); // necessary for id passing
    container.make(_api).applyToApp(app);
    return request(app)
      .get(path)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + tokenString);
  }

  beforeEach(async () => {
    container = inja().implement(_config, {
      init() {
        return {
          get() {},

          require(key) {
            switch (key) {
              case "token.signingSecret":
                return "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
              case "token.encryptionSecret":
                return "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
            }
          }
        };
      }
    });

    tokenPayload = {
      iss: "Canvas",
      aud: ["Instructure"],
      domain: "test.canvas.local",
      exp: moment()
        .add(1, "hours")
        .unix(),
      nbf: moment()
        .subtract(30, "seconds")
        .unix(),
      iat: moment().unix(),
      jti: "some-long-string-that-is-unique",
      sub: 42
    };

    token = container.make(_token);
    tokenString = await token.create(tokenPayload);
  });

  afterEach(() => {});

  it("proxies api requests from good tokens", function(done) {
    nock("http://test.canvas.local")
      .get(
        "/api/v1/folders/1/files?per_page=50&include[]=preview_url&use_verifiers=0"
      )
      .reply(200, [
        {
          display_name: "file.txt",
          created_at: "2012-07-06T14:58:50Z",
          updated_at: "2012-07-06T14:58:50Z"
        }
      ]);

    getProxied("/api/files/1", tokenString)
      .expect(200)
      .expect(/file.txt/)
      .end(done);
  });

  it("passes on response codes", function(done) {
    nock("http://test.canvas.local")
      .get(
        "/api/v1/folders/1/files?per_page=50&include[]=preview_url&use_verifiers=0"
      )
      .reply(500, { error: "an internal error occurred" });

    getProxied("/api/files/1", tokenString)
      .expect(500)
      .expect(/error/)
      .end(done);
  });

  it("uses query parameters to construct paths", function(done) {
    nock("http://test.canvas.local")
      .get("/api/v1/courses/999/pages?sort=title&per_page=50")
      .reply(200, [
        {
          url: "my-page-title",
          title: "My Page Title",
          created_at: "2012-08-06T16:46:33-06:00",
          updated_at: "2012-08-08T14:25:20-06:00"
        }
      ]);

    getProxied("/api/wikiPages?contextType=course&contextId=999", tokenString)
      .expect(200)
      .expect(/My Page Title/)
      .end(done);
  });

  it("catches bad tokens before proxying", async () => {
    tokenPayload.exp = moment()
      .subtract(10, "minutes")
      .unix();
    const scope = nock("http://test.canvas.local")
      .get(
        "/api/v1/folders/1/files?per_page=50&include[]=preview_url&use_verifiers=0"
      )
      .reply(200, []);

    const badToken = await token.create(tokenPayload);
    return new Promise((resolve, reject) => {
      getProxied("/api/files/1", badToken)
        .expect(401)
        .expect(/token expired/)
        .end(err => {
          try {
            assert.ok(!scope.isDone());
          } catch (caughtErr) {
            err = caughtErr;
          }
          err ? reject(err) : resolve();
        });
    });
  });
});
