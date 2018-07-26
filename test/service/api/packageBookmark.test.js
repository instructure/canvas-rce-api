"use strict";

const { equal } = require("assert");
const packageBookmark = require("../../../app/api/packageBookmark");

describe("packageBookmark", () => {
  let request, bookmark;

  beforeEach(() => {
    request = {
      baseUrl: "/a/b",
      path: "/c",
      query: { id: 47, bookmark: "oldbookmark" },
      protocol: "http",
      get: header => header === "Host" && "somehost:3000"
    };
    bookmark = "canvasurl";
  });

  it("returns null with no bookmark", () => {
    const url = packageBookmark(request);
    equal(url, null);
  });

  it("forms corect url", () => {
    const url = packageBookmark(request, bookmark);
    equal(url, "http://somehost:3000/a/b/c?id=47&bookmark=canvasurl");
  });
});
