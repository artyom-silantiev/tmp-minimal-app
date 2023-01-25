import express from 'express';
import { ControllerHandler, CtrlHandlerArgs, Method, sControllerHandlers, sCtrlHandlerArgs } from './controller';
import _ from 'lodash';

export type Route = {
  path: string;
  middlewares?: ((req: express.Request, res: express.Response, next: express.NextFunction) => void)[];
  controller?: any;
  router?: Router;
  subRoutes?: Route[];
};

export type Router = {
  routes: Route[];
}

function getCtrlHandlerArgs(target: Object, key: string | symbol, req: express.Request) {
  const handlerArgs = Reflect.getMetadata(sCtrlHandlerArgs, target) as CtrlHandlerArgs;
  if (!handlerArgs[key]) {
    return [];
  }

  const resArgs = [] as any[];
  const args = handlerArgs[key];
  for (const arg of args) {
    if (arg.type === 'Req') {
      resArgs.push(req);
    } else if (arg.type === 'Param') {
      resArgs.push(arg.data ? req.params[arg.data] : req.params);
    } else if (arg.type === 'Query') {
      resArgs.push(arg.data ? req.query[arg.data] : req.query);
    }
  }

  return resArgs;
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
        const args = getCtrlHandlerArgs(ctrlHandler.target, ctrlHandler.key, req);
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

    if (route.subRoutes) {
      parseRouter({
        routes: route.subRoutes,
      }, expressApp, routePath);
    }

    expressApp.use(routePath, expressRouter);
  }
}
