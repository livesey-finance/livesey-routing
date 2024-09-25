class Response {
  constructor(res) {
    this.res = res;
  }

  send(data) {
    if (typeof data === 'object') {
      this.res.setHeader('Content-Type', 'application/json');
      this.res.end(JSON.stringify(data));
    } else {
      this.res.setHeader('Content-Type', 'text/plain');
      this.res.end(data);
    }
  }

  json(data) {
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(data));
  }

  status(code) {
    this.res.statusCode = code;
    return this;
  }
}

module.exports = {
  Response
};
