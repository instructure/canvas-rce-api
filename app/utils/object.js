"use strict";

function getByPath(path, obj) {
  const keys = path.split(".");
  let next = obj;
  for (let key of keys) {
    if (typeof next === "object") {
      next = next[key];
    } else {
      next = null;
    }
    if (next == null) {
      break;
    }
  }
  return next;
}

module.exports = { getByPath };
