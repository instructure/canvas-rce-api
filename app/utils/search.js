function getSearch(query) {
  const searchTerm = query.search_term || query.searchTerm;

  if (!searchTerm) {
    return "";
  }

  let encodedTerm;
  try {
    isSearchTermEncoded = searchTerm !== decodeURIComponent(searchTerm);
    encodedTerm = isSearchTermEncoded
      ? searchTerm
      : encodeURIComponent(searchTerm);
  } catch {
    encodedTerm = encodeURIComponent(searchTerm);
  }
  return `&search_term=${encodedTerm}`;
}

module.exports = { getSearch };
