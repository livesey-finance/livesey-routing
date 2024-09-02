import { IncomingMessage } from 'node:http';
import { URL } from 'node:url';

export class Request {
  constructor(req) {
    if (!(req instanceof IncomingMessage)) {
      throw new Error('Request must be an instance of IncomingMessage');
    }

    this.req = req;
    this.urlObj = new URL(req.url, `http://${req.headers.host}`);
  }

  get method() {
    return this.req.method;
  }

  get url() {
    return this.req.url;
  }

  get header() {
    return this.req.headers[name.toLowerCase()];
  }

  get headers() {
    return this.req.headers;
  }

  get path() {
    return this.urlObj.pathname;
  }

  async parseBody() {
    let body = '';

    for await (const chunk of this.req) {
      body += chunk.toString();
    }

    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  extractParams(routePath) {
    const params = {};
    const urlPath = this.urlObj.pathname;
    const routeParts = routePath.split('/').filter(Boolean);
    const urlParts = urlPath.split('/').filter(Boolean);

    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = urlParts[index];
      }
    });

    return params;
  }
}
