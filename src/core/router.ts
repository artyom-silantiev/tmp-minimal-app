import express from 'express';
import { getCtxHandlersFromController, Method } from './controller';
import _ from 'lodash';
import { createLogger } from './logger';

const logger = createLogger('Router');

export type CtxHandler = (ctx: Ctx | any) => Promise<any> | any;
export type RouteCtxHandler = {
  path?: string;
  method: Method;
  handler: CtxHandler;
};
export type Middleware = CtxHandler;

export type StaticOptions = {
  root: string;
};

export type Route = {
  path: string;
  middlewares?: Middleware[];

  ctxHandlers?: RouteCtxHandler[];
  controller?: any;
  controllers?: any[];
  subRoutes?: Route[];

  static?: StaticOptions;
};

export class Router {
  routes = [] as Route[];

  constructor(routes: Route[]) {
    this.routes = routes;
  }
}

export type Ctx = ReturnType<typeof getCtx>;
function getCtx(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  return {
    body: req.body || null,
    params: req.params || null,
    query: req.query || null,
    headers: req.headers || null,
    req,
    res,
    next,
  };
}

function getExpressRouterHandler(
  method: Method,
  expressRouter: express.Router
) {
  let expressRouterHandler;

  if (method === 'USE') {
    expressRouterHandler = expressRouter.use;
  } else if (method === 'ALL') {
    expressRouterHandler = expressRouter.all;
  } else if (method === 'GET') {
    expressRouterHandler = expressRouter.get;
  } else if (method === 'HEAD') {
    expressRouterHandler = expressRouter.head;
  } else if (method === 'OPTIONS') {
    expressRouterHandler = expressRouter.options;
  } else if (method === 'PATCH') {
    expressRouterHandler = expressRouter.patch;
  } else if (method === 'POST') {
    expressRouterHandler = expressRouter.post;
  } else if (method === 'PUT') {
    expressRouterHandler = expressRouter.put;
  } else if (method === 'DELETE') {
    expressRouterHandler = expressRouter.delete;
  }

  return expressRouterHandler;
}

function useCtxHandlers(
  ctxHandlers: RouteCtxHandler[],
  expressRouter: express.Router,
  routePath: string
) {
  for (const ctxHandler of ctxHandlers) {
    useRouteCtxHandler(ctxHandler, expressRouter, routePath);
  }
}

function useRouteCtxHandler(
  routeCtxHandler: RouteCtxHandler,
  expressRouter: express.Router,
  routePath: string
) {
  const expressHandler = getExpressRouterHandler(
    routeCtxHandler.method,
    expressRouter
  );

  let path = '';
  if (routeCtxHandler.path) {
    if (
      !_.startsWith(routeCtxHandler.path, '/') &&
      routeCtxHandler.path.length > 0
    ) {
      routeCtxHandler.path = '/' + routeCtxHandler.path;
    }
    path = routeCtxHandler.path;
  }

  const handler = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const ctx = getCtx(req, res, next);
      const resData = await routeCtxHandler.handler(ctx);
      if (typeof resData === 'undefined') {
        return;
      }
      if (typeof resData === 'string') {
        res.send(resData);
      } else {
        res.json(resData);
      }
    } catch (error) {
      next(error);
    }
  };

  if (routeCtxHandler.method === 'USE') {
    expressHandler.apply(expressRouter, [handler]);
  } else {
    expressHandler.apply(expressRouter, [path, handler]);
  }

  logger.log(
    `${routeCtxHandler.method} ${(routePath + path).replace('//', '/')}`
  );
}

function parseRoutes(
  app: express.Application | express.Router,
  routes: Route[],
  path: string = '',
  level: number = 0
) {
  if (!_.startsWith(path, '/')) {
    path = '/' + path;
  }

  for (const route of routes) {
    if (_.startsWith(route.path, '/')) {
      route.path = route.path.substring(1);
    }

    let appIsApp = true;
    if (Object.getPrototypeOf(app) == express.Router) {
      appIsApp = false;
    }
    const expressRouter = express.Router();

    const routePath = path + route.path;
    logger.log(`RouterPath:"${routePath}", deep:${level}`);

    if (route.middlewares) {
      for (const middleware of route.middlewares) {
        useRouteCtxHandler(
          {
            method: 'USE',
            handler: middleware,
          },
          expressRouter,
          routePath
        );
      }
    }

    if (route.ctxHandlers) {
      useCtxHandlers(route.ctxHandlers, expressRouter, routePath);
    }

    if (route.controller) {
      const ctxHandlers = getCtxHandlersFromController(route.controller);
      useCtxHandlers(ctxHandlers, expressRouter, routePath);
    }

    if (route.controllers) {
      for (const controller of route.controllers) {
        const ctxHandlers = getCtxHandlersFromController(controller);
        useCtxHandlers(ctxHandlers, expressRouter, routePath);
      }
    }

    if (route.subRoutes) {
      parseRoutes(expressRouter, route.subRoutes, routePath, level + 1);
    }

    if (route.static) {
      app.use(express.static(route.static.root));
      logger.log(`STATIC ${routePath} => ${route.static.root}`);
    }

    if (appIsApp) {
      (app as express.Application).use(routePath, expressRouter);
    } else {
      (app as express.Router).use(routePath, expressRouter);
    }
  }
}

export function initAppRouter(
  app: express.Application | express.Router,
  routes: Route[]
) {
  parseRoutes(app, routes, '', 0);
}
