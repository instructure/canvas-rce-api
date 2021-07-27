function getSearch(query) {
  const searchTerm = query.search_term || query.searchTerm

  if (!searchTerm) {
    return "";
  }
  return `&search_term=${searchTerm}`;
}

module.exports = { getSearch };
