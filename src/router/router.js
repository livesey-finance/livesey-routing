const { Request } = require('../request/request.js');
const { Response } = require('../response/response.js');

class Route {
  constructor(method, path, handler) {
    this.method = method.toUpperCase();
    this.path = path;
    this.handler = handler;
  }

  match(req) {
    return (
      this.method === req.method &&
      new RegExp(`^${this.path.replace(/:\w+/g, '(\\w+)')}$`).test(req.path)
    );
  }

  extractParams(req) {
    return req.extractParams(this.path);
  }
}

class Router {
  constructor(middlewarePath = '', routes = new Map()) {
    this.middlewarePath = middlewarePath;
    this.routes = routes;
    this.middleware = new Map();
  }

  static use(basePath, router) {
    const newRouter = new Router(basePath);
    newRouter.middleware.set(basePath, router);
    return newRouter;
  }

  handleRequest(req, res) {
    const request = new Request(req);
    const response = new Response(res);

    for (const [basePath, router] of this.middleware) {
      if (request.url.startsWith(basePath)) {
        const modifiedUrl = request.url.slice(basePath.length) || '/';
        request.req.url = modifiedUrl;
        router.handleRequest(request.req, res);
        return;
      }
    }

    for (const route of this.routes.values()) {
      if (route.match(request)) {
        request.params = route.extractParams(request);
        route.handler(request, response);
        return;
      }
    }

    res.statusCode = 404;
    res.end('Not Found');
  }
}

class RouteBuilder {
  constructor() {
    this.routes = new Map();
  }

  addRoute(method, path, handler) {
    const route = new Route(method, path, handler);
    this.routes.set(`${method.toUpperCase()} ${path}`, route);
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

module.exports = {
  Route,
  Router,
  RouteBuilder
};
