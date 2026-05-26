import { randomUUID } from "node:crypto";

const HEADER_NAME = "X-Request-Id";

export function addRequestId(req, res, next) {
  const id = req.get(HEADER_NAME) ?? randomUUID();
  res.set(HEADER_NAME, id);
  req.id = id;
  next();
}
