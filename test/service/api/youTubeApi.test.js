import assert from "assert";

import nock from "nock";

import { youTubeTitle } from "../../../app/api/youTubeApi.js";

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
      key: "some-long-api-key",
    };
    return nock("https://content.googleapis.com")
      .get("/youtube/v3/search")
      .query(queryParams)
      .reply(result, body);
  };

  it("uses the api key and search term", (done) => {
    let vidId = "abcdefghijk";
    let req = { query: { vid_id: vidId } };
    let scope = buildYouTubeScope(vidId, {
      items: [
        {
          id: { videoId: `${vidId}` },
          snippet: { title: `my video title ${vidId}` },
        },
      ],
    });
    let resp = {
      status: (status) => {
        assert.equal(status, 200);
      },
      json: () => {
        assert.ok(scope.isDone());
        done();
      },
    };
    youTubeTitle(req, resp);
  });

  it("returns 404 with JSON body when vidId not found", (done) => {
    let vidId = "bogusidhere";
    let req = { query: { vid_id: vidId } };
    buildYouTubeScope(vidId, {
      items: [
        {
          id: { videoId: "otherbogusis" },
          snippet: { title: "my video title otherbogusid" },
        },
      ],
    });
    let resp = {
      status: (status) => {
        assert.equal(status, 404);
      },
      json: (data) => {
        assert.deepStrictEqual(data, {
          error: "video_not_found",
          id: vidId,
        });
        done();
      },
    };
    youTubeTitle(req, resp);
  });

  it("safely returns attacker-controlled vidId via JSON (no HTML interpretation)", (done) => {
    const vidId = '<script>alert("xss")</script>';
    const req = { query: { vid_id: vidId } };

    buildYouTubeScope(vidId, {
      items: [
        {
          id: { videoId: "otherbogusid" },
          snippet: { title: "my video title otherbogusid" },
        },
      ],
    });

    const resp = {
      status: (code) => {
        assert.equal(code, 404);
        return resp;
      },
      json: (data) => {
        // JSON response means Content-Type is application/json, so the
        // browser will never interpret the body as HTML.
        assert.deepStrictEqual(data, {
          error: "video_not_found",
          id: vidId,
        });
        done();
      },
    };

    youTubeTitle(req, resp);
  });

  it("encodes vid_id so injected query parameters cannot override real ones", (done) => {
    const maliciousVidId = 'abc"&maxResults=50&key=ATTACKER&foo=bar';
    const req = { query: { vid_id: maliciousVidId } };

    const scope = nock("https://content.googleapis.com")
      .get("/youtube/v3/search")
      .query((actual) => {
        return (
          actual.part === "snippet" &&
          actual.maxResults === "2" &&
          actual.key === "some-long-api-key" &&
          actual.q === `"${maliciousVidId}"` &&
          actual.foo === undefined
        );
      })
      .reply(200, { items: [] });

    const resp = {
      status: (code) => {
        assert.equal(code, 404);
        return resp;
      },
      json: () => {
        assert.ok(
          scope.isDone(),
          "expected request to match with encoded params",
        );
        done();
      },
    };

    youTubeTitle(req, resp);
  });

  it("encodes vid_id containing a raw '&' so it does not start a new param", (done) => {
    const maliciousVidId = "foo&key=ATTACKER";
    const req = { query: { vid_id: maliciousVidId } };

    const scope = nock("https://content.googleapis.com")
      .get("/youtube/v3/search")
      .query((actual) => {
        return (
          actual.key === "some-long-api-key" &&
          actual.q === `"${maliciousVidId}"`
        );
      })
      .reply(200, { items: [] });

    const resp = {
      status: () => resp,
      json: () => {
        assert.ok(scope.isDone());
        done();
      },
    };

    youTubeTitle(req, resp);
  });

  it("fails on youtube call fail", (done) => {
    let vidId = "abcdefghijk";
    let req = { query: { vid_id: vidId } };
    buildYouTubeScope(
      vidId,
      {
        errors: [{ error: 100, message: "this error message" }],
      },
      500,
    );
    let resp = {
      status: (status) => {
        assert.equal(status, 500);
      },
      send: (data) => {
        assert.equal(data, "Internal Error, see server logs");
        done();
      },
    };
    youTubeTitle(req, resp);
  });
});
