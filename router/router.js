import { URL } from "node:url";
import { Request } from "../request/request.js";
import { Response } from "../response/response.js";

export class Route {
    constructor(method, path, handler) {
      this.method = method.toUpperCase();
      this.path = path;
      this.handler = handler;
    }
  
    match(req) {
      const { method, url } = req;
      const pathname = new URL(url, `http://${req.headers.host}`).pathname;
      const pathRegex = new RegExp(`^${this.path.replace(/:\w+/g, '(\\w+)')}$`);
      return this.method === method && pathRegex.test(pathname);
    }
  
    extractParams(url) {
      const params = {};
      const pathRegex = new RegExp(`^${this.path.replace(/:\w+/g, '(\\w+)')}$`);
      const match = url.pathname.match(pathRegex);
  
      if (match) {
        const keys = this.path.split('/').filter(part => part.startsWith(':')).map(part => part.slice(1));
        keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
      }
  
      return params;
    }
}
  
export class RouteBuilder {
    constructor() {
      this.routes = new Map();
    }
  
    addRoute(method, path, handler) {
      const route = new Route(method, path, handler);
      const key = `${method.toUpperCase()} ${path}`;
      this.routes.set(key, route);
      return this;
    }
  
    get(path, handler) {
      return this.addRoute('GET', path, handler);
    }
  
    post(path, handler) {
      return this.addRoute('POST', path, handler);
    }
  
    put(path, handler) {
      return this.addRoute('PUT', path, handler);
    }
  
    delete(path, handler) {
      return this.addRoute('DELETE', path, handler);
    }
  
    build() {
      return new Router(this.routes);
    }
}
  
export class Router {
    constructor(routes) {
      this.routes = routes;
    }
  
    handleRequest(req, res) {
      const request = new Request(req);
      const response = new Response(res);
  
      for (const route of this.routes.values()) {
        if (route.match(req)) {
          req.routePath = route.path;
          request.params = request.extractParams(req.routePath); 
          route.handler(request, response);
          return;
        }
      }
  
      res.statusCode = 404;
      res.end('Not Found');
    }
}
