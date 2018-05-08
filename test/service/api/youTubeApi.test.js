"use strict";

const youTubeTitle = require("../../../app/api/youTubeApi");
const assert = require("assert");
const nock = require("nock");

describe("YouTube API", () => {
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "some-long-api-key";
  });

  afterEach(() => {
    process.env.YOUTUBE_API_KEY = undefined;
  });

  let buildYouTubeScope = (vidId, body, result = 200) => {
    let queryParams = {
      part: "snippet",
      maxResults: "2",
      q: `"${vidId}"`,
      key: "some-long-api-key"
    };
    return nock("https://content.googleapis.com")
      .get("/youtube/v3/search")
      .query(queryParams)
      .reply(result, body);
  };

  it("uses the api key and search term", done => {
    let vidId = "abcdefghijk";
    let req = { query: { vid_id: vidId } };
    let scope = buildYouTubeScope(vidId, {
      items: [
        {
          id: { videoId: `${vidId}` },
          snippet: { title: `my video title ${vidId}` }
        }
      ]
    });
    let resp = {
      status: status => {
        assert.equal(status, 200);
      },
      json: () => {
        assert.ok(scope.isDone());
        done();
      }
    };
    youTubeTitle(req, resp);
  });

  it("fails on vidId not found", done => {
    let vidId = "bogusidhere";
    let req = { query: { vid_id: vidId } };
    buildYouTubeScope(vidId, {
      items: [
        {
          id: { videoId: "otherbogusis" },
          snippet: { title: "my video title otherbogusid" }
        }
      ]
    });
    let resp = {
      status: status => {
        assert.equal(status, 500);
      },
      send: data => {
        assert.equal(data, `Video "${vidId}" not found.`);
        done();
      }
    };
    youTubeTitle(req, resp);
  });

  it("fails on youtube call fail", done => {
    let vidId = "abcdefghijk";
    let req = { query: { vid_id: vidId } };
    buildYouTubeScope(
      vidId,
      {
        errors: [{ error: 100, message: "this error message" }]
      },
      500
    );
    let resp = {
      status: status => {
        assert.equal(status, 500);
      },
      send: data => {
        assert.equal(data, "Internal Error, see server logs");
        done();
      }
    };
    youTubeTitle(req, resp);
  });
});
