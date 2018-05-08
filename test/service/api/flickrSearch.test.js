"use strict";

const flickrSearch = require("../../../app/api/flickrSearch");
const assert = require("assert");
const nock = require("nock");

describe("Flickr Search", () => {
  beforeEach(() => {
    process.env.FLICKR_API_KEY = "some-long-api-key";
  });

  afterEach(() => {
    process.env.FLICKR_API_KEY = undefined;
  });

  let buildFlickrScope = (body, searchTerm) => {
    let queryParams = {
      method: "flickr.photos.search",
      format: "json",
      sort: "relevance",
      license: "1,2,3,4,5,6",
      per_page: "15",
      nojsoncallback: "1",
      api_key: "some-long-api-key",
      text: searchTerm,
      extras: "needs_interstitial"
    };
    return nock("https://api.flickr.com")
      .get("/services/rest")
      .query(queryParams)
      .reply(200, {
        photos: {
          photo: body
        }
      });
  };

  let buildResponseForScope = (scope, done) => {
    return {
      status: () => {},
      send: () => {
        assert.ok(scope.isDone());
        done();
      }
    };
  };

  let buildRequest = searchTerm => {
    return {
      query: { term: searchTerm }
    };
  };

  it("uses the api key and search term", done => {
    let req = buildRequest("chess");
    let scope = buildFlickrScope([], "chess");
    let resp = buildResponseForScope(scope, done);
    flickrSearch(req, resp);
  });

  it("uri encodes search term", done => {
    let req = buildRequest("cute cats");
    let scope = buildFlickrScope([], "cute cats");
    let resp = buildResponseForScope(scope, done);
    flickrSearch(req, resp);
  });

  it("transforms results into useful links", done => {
    let req = buildRequest("am");
    let body = [
      { farm: 1, server: 2, id: 3, secret: 4, title: "ham" },
      { farm: 5, server: 6, id: 7, secret: 8, title: "spam" }
    ];
    buildFlickrScope(body, "am");

    let resp = {
      status: () => {},
      send: body => {
        assert.equal(body[0].href, "https://farm1.static.flickr.com/2/3_4.jpg");
        done();
      }
    };

    flickrSearch(req, resp);
  });

  it("transform includes link to web page for photo", done => {
    let req = buildRequest("am");
    let body = [
      { farm: 1, server: 2, id: 3, secret: 4, title: "ham", owner: "bill" },
      { farm: 5, server: 6, id: 7, secret: 8, title: "spam", owner: "bob" }
    ];
    buildFlickrScope(body, "am");

    let resp = {
      status: () => {},
      send: body => {
        try {
          assert.equal(body[0].link, "https://www.flickr.com/photos/bill/3");
          assert.equal(body[1].link, "https://www.flickr.com/photos/bob/7");
          done();
        } catch (err) {
          done(err);
        }
      }
    };

    flickrSearch(req, resp);
  });

  it("transformSearchResults removes photos with needs_interstitial=1", done => {
    let req = buildRequest("am");
    let body = [
      {
        farm: 1,
        server: 2,
        id: 3,
        secret: 4,
        title: "ham",
        owner: "bill",
        needs_interstitial: 1
      },
      {
        farm: 5,
        server: 6,
        id: 7,
        secret: 8,
        title: "spam",
        owner: "bob",
        needs_interstitial: 0
      }
    ];
    buildFlickrScope(body, "am");

    let resp = {
      status: () => {},
      send: body => {
        try {
          assert.equal(body.length, 1);
          assert.equal(body[0].link, "https://www.flickr.com/photos/bob/7");
          done();
        } catch (err) {
          done(err);
        }
      }
    };

    flickrSearch(req, resp);
  });
});
