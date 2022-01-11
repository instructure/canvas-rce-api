function getSearch(query) {
  const searchTerm = query.search_term || query.searchTerm;

  if (!searchTerm) {
    return "";
  }

  const isSearchTermEncoded = searchTerm !== decodeURIComponent(searchTerm);
  return isSearchTermEncoded
    ? `&search_term=${searchTerm}`
    : `&search_term=${encodeURIComponent(searchTerm)}`;
}

module.exports = { getSearch };
