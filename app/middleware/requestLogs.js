"use strict";

const morgan = require("morgan");

// assumes requests have had id added already
morgan.token("id", function getId(req) {
  return req.id;
});

function logWithFormat(stream, immediate) {
  immediate = immediate || false;
  let format =
    '[:id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  return morgan(format, { stream: stream, immediate: immediate });
}

function loggingStream() {
  if (process.env.NODE_ENV == "test") {
    return require("dev-null")();
  } else {
    return process.stdout;
  }
}

function applyToApp(app, stream) {
  stream = stream || loggingStream();
  let middleware = logWithFormat(stream);
  app.use(middleware);
}

module.exports = { middleware: logWithFormat, applyToApp };
