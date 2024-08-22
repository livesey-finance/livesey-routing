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
      return new Router('', this.routes);
  }
}
  
export class Router {
    constructor(middlewarePath, routes) {
      this.middlewarePath = middlewarePath;
      this.routes = routes || new Map();
      this.middleware = new Map(); // Key: Path, Value: Router instance
    }

    static use (basePath, router) {
      const newRouter = new Router(basePath);
      newRouter.middleware.set(basePath, router);
      return newRouter;
    }
  
    handleRequest(req, res) {
      const request = new Request(req);
      const response = new Response(res);

      for (const [basePath, router] of this.middleware) {
        const fullPath = `${basePath}`;

        if (req.url.startsWith(fullPath)) {
          req.url = req.url.slice(fullPath.length) || '/';
          router.handleRequest(req, res);
          return;
        }
      }

      for (const route of this.routes.values()) {
        if (route.match(req)) {
          req.routePath = `${this.middlewarePath}${route.path}`;
          request.params = route.extractParams(new URL(req.url, `http://${req.headers.host}`));
          route.handler(request, response);
          return;
        }
      }
  
      res.statusCode = 404;
      res.end('Not Found');
    }
}
