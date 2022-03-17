"use strict";

function optionalQuery(query, name) {
  return query[name] ? `&${name}=${query[name]}` : "";
}

module.exports = { optionalQuery };
