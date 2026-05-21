function optionalQuery(query, name) {
  return query[name] ? `&${name}=${query[name]}` : "";
}

export { optionalQuery };
