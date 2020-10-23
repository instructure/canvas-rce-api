function getSearch(query) {
  if (!query.search_term) {
    return "";
  }
  return `&search_term=${query.search_term}`;
}

module.exports = { getSearch };
