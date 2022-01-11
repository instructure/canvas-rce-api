"use strict";

const assert = require("assert");
const search = require("../../../app/utils/search");

describe("search(query)", () => {
  let query = new Object();

  afterEach(() => {
    query.search_term = undefined;
  });

  it("returns empty string if query search term is undefined", () => {
    query.search_term = undefined;
    const getSearchResult = search.getSearch(query);
    assert.strictEqual(getSearchResult, "");
  });

  it("returns properly encoded ASCII characters from query search term", () => {
    const searchText = "some search term";
    const encodedSearchText = encodeURIComponent(searchText);
    query.search_term = searchText;
    const getSearchResult = search.getSearch(query);
    assert(getSearchResult.endsWith(encodedSearchText));
  });

  it("returns properly encoded special characters from query search term", () => {
    const specialCharsSearchText = "❤️ or Œ åßÑ";
    const encodedSearchText = encodeURIComponent(specialCharsSearchText);
    query.search_term = specialCharsSearchText;
    const getSearchResult = search.getSearch(query);
    assert.ok(
      getSearchResult.endsWith(encodedSearchText),
      `Expected ${getSearchResult} to end with ${encodedSearchText}`
    );
  });

  it("does not encode again an already encoded search term", () => {
    const encodedSearchText = encodeURIComponent("some search text");
    query.search_term = encodedSearchText;
    const getSearchResult = search.getSearch(query);
    assert.ok(
      getSearchResult.endsWith(encodedSearchText),
      `Expected ${getSearchResult} to end with ${encodedSearchText}`
    );
  });
});
