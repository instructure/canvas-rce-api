function buildUrl(domain, path) {
  var protocol = "http";
  if (process.env.HTTP_PROTOCOL_OVERRIDE) {
    // https://instructure.atlassian.net/browse/CORE-2144
    protocol = process.env.HTTP_PROTOCOL_OVERRIDE;
  } else if (process.env.NODE_ENV === "production") {
    protocol = "https";
  }
  return protocol + "://" + domain + (path || "");
}

export { buildUrl };
