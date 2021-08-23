function getSort(query) {
  const sortBy = query.sort;
  const orderBy = query.order;

  if (!sortBy) {
    return "";
  }

  return orderBy ? `&sort=${sortBy}&order=${orderBy}` : `&sort=${sortBy}`;
}

module.exports = { getSort };
