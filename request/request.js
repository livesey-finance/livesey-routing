import { URL } from 'node:url';

export class Request {
  constructor(req) {
    this.req = req;
    this.url = new URL(req.url, `http://${req.headers.host}`);
    this.method = req.method;
    this.params = {};
    this.body = null;
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

  getParams() {
    return this.url.searchParams;
  }

  async getBody() {
    if (this.body === null) {
      this.body = await this.parseBody();
    }
    return this.body;
  }

  extractParams(routePath) {
    const params = {};
    const urlPath = this.url.pathname;
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
