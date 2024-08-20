import { URL } from "node:url";

export class Request {
    constructor(req) {
      this.req = req;
      this.url = new URL(req.url, `http://${req.headers.host}`);
      this.method = req.method;
      this.params = {};
      this.body = this.parseBody();
      // cookies
    }
  
    async parseBody() {
      return new Promise((resolve, reject) => {
        let body = '';
        this.req.on('data', chunk => {
          body += chunk.toString();
        });
        this.req.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
        this.req.on('error', err => {
          reject(err);
        });
      });
    }
  
    getParams() {
      return this.url.searchParams;
    }
  
    getBody() {
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
