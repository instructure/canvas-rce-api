class HandledException extends Error {
  constructor(message, status = 500, code) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    if (code !== undefined) {
      this.code = code;
    }
  }

  responseStatus() {
    return this.status || 500;
  }

  handle(req, res, next) {
    res.status(this.responseStatus());
    res.end(this.message);
    next();
  }
}

export { HandledException };
