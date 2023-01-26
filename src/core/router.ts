import express from 'express';
import { ControllerHandler, Method, sControllerHandlers } from './controller';
import _ from 'lodash';

export type CtxHandler = (ctx: Ctx) => Promise<any> | any;
export type RouteCtxHandler = {
  path: string;
  method: Method;
  handler: CtxHandler;
};
export type ExpressMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void> | void;

export type Route = {
  path: string;
  middlewares?: ExpressMiddleware[];

  ctxHandlers?: RouteCtxHandler[];
  controller?: any;
  router?: Router;
  routes?: Route[];
};

export class Router {
  routes = [] as Route[];
}

export type Ctx = ReturnType<typeof getCtx>;
function getCtx(req: express.Request, res: express.Response) {
  return {
    body: req.body || null,
    params: req.params || null,
    query: req.query || null,
    req,
    res
  };
}

function getExpressRouterHandler(method: Method, expressRouter: express.Router,) {
  let expressRouterHandler;

  if (method === 'ALL') {
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

function getCtxHandlersFromController(controller: any) {
  const ctxHandlers = [] as RouteCtxHandler[];

  const controllerHandlers = Reflect.getMetadata(sControllerHandlers, controller) as ControllerHandler[];

  for (const ctrlHandler of controllerHandlers) {
    const controllerHandler = ctrlHandler.target[ctrlHandler.key] as () => Promise<any> | any;
    const ctxHandler = controllerHandler.bind(ctrlHandler.target) as CtxHandler;


    ctxHandlers.push({
      method: ctrlHandler.method,
      path: ctrlHandler.path,
      handler: ctxHandler
    });
  }

  return ctxHandlers;
}

function useCtxHandlers(ctxHandlers: RouteCtxHandler[], expressRouter: express.Router, routePath: string) {
  for (const ctxHandler of ctxHandlers) {
    const expressHandler = getExpressRouterHandler(ctxHandler.method, expressRouter);

    if (!_.startsWith(ctxHandler.path, '/') && ctxHandler.path.length > 0) {
      ctxHandler.path = '/' + ctxHandler.path;
    }
    const path = ctxHandler.path;

    const handler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const ctx = getCtx(req, res);

        const resData = await ctxHandler.handler(ctx);
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
    }
    expressHandler.apply(expressRouter, [path, handler]);

    console.log(`route added: ${ctxHandler.method} ${(routePath + path).replace('//', '/')}`);
  }
}

export function parseRouter(router: Router, expressApp: express.Application, path?: string) {
  path = path || '';

  if (!_.startsWith(path, '/')) {
    path = '/' + path;
  }

  for (const route of router.routes) {
    if (_.startsWith(route.path, '/')) {
      route.path = route.path.substring(1);
    }

    const routePath = path + route.path;
    const expressRouter = express.Router();

    if (route.middlewares) {
      for (const middleware of route.middlewares) {
        expressRouter.use(middleware);
      }
    }

    if (route.ctxHandlers) {
      useCtxHandlers(route.ctxHandlers, expressRouter, routePath);
    }

    if (route.controller) {
      const ctxHandlers = getCtxHandlersFromController(route.controller);
      useCtxHandlers(ctxHandlers, expressRouter, routePath);
    }

    if (route.router) {
      parseRouter(route.router, expressApp, routePath);
    }

    if (route.routes) {
      parseRouter({
        routes: route.routes,
      }, expressApp, routePath);
    }

    expressApp.use(routePath, expressRouter);
  }
}
