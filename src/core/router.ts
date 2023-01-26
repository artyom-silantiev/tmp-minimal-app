import express from 'express';
import { ControllerHandler, Method, sControllerHandlers } from './controller';
import _ from 'lodash';

export type ExpressMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void> | void;
export type Route = {
  path: string;
  middlewares?: ExpressMiddleware[];
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

function useController(controller: any, expressRouter: express.Router, routePath: string) {
  const controllerHandlers = Reflect.getMetadata(sControllerHandlers, controller) as ControllerHandler[];

  function getExpressRouterHandler(method: Method) {
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

  for (const ctrlHandler of controllerHandlers) {
    const expressHandler = getExpressRouterHandler(ctrlHandler.method);
    const controllerHandler = ctrlHandler.target[ctrlHandler.key] as () => Promise<any> | any;

    if (!_.startsWith(ctrlHandler.path, '/') && ctrlHandler.path.length > 0) {
      ctrlHandler.path = '/' + ctrlHandler.path;
    }

    const path = ctrlHandler.path;

    const handler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const args = [getCtx(req, res)];
        const resData = await controllerHandler.apply(ctrlHandler.target, args as []);
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

    console.log(`App route added: ${ctrlHandler.method} ${(routePath + path).replace('//', '/')}`);
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

    if (route.controller) {
      useController(route.controller, expressRouter, routePath);
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
