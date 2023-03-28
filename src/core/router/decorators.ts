// Controller decorator

import { CtxHandler, RouteHandler } from './router';

const sController = Symbol('Controller');
type ControllerMeta = {
  ctxMiddlewares: CtxHandler[];
};
export function Controller() {
  return function (target: Function) {
    Reflect.defineMetadata(
      sController,
      {
        ctxMiddlewares: [],
      } as ControllerMeta,
      target
    );
  } as ClassDecorator;
}

// CtxMiddlewares decorator
export function CtxMiddlewares(middlewares: CtxHandler[]) {
  return function (target: any, key?: string | symbol) {
    if (key) {
      // method decorator

      const controllerHandlers = Reflect.getMetadata(
        sControllerHandlers,
        target
      ) as Map<string | symbol, ControllerHandler>;
      const handler = controllerHandlers.get(key);

      if (!handler) {
        throw new Error('Controller handler meta not found');
      }

      handler.ctxMiddlewares = middlewares;
    } else {
      // class decorator

      const controllerMeta = Reflect.getMetadata(
        sController,
        target
      ) as ControllerMeta;

      if (!controllerMeta) {
        throw new Error('Controller meta not found');
      }

      controllerMeta.ctxMiddlewares = middlewares;
    }
  };
}

// Controller methods decorators
const sControllerHandlers = Symbol('ControllerHandlers');
export type Method =
  | 'USE'
  | 'ALL'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'DELETE';
type ControllerHandler = {
  method: Method;
  path: string;
  key: string | symbol;
  ctxMiddlewares: CtxHandler[];
};

function controllerHandler(method: Method, path: string) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    if (!Reflect.hasMetadata(sControllerHandlers, target)) {
      Reflect.defineMetadata(sControllerHandlers, new Map(), target);
    }

    const controllerHandlers = Reflect.getMetadata(
      sControllerHandlers,
      target
    ) as Map<string | symbol, ControllerHandler>;
    controllerHandlers.set(key, {
      method,
      path,
      key,
      ctxMiddlewares: [],
    });
  } as MethodDecorator;
}

export function All(path: string = '') {
  return controllerHandler('ALL', path);
}

export function Get(path: string = '') {
  return controllerHandler('GET', path);
}

export function Head(path: string = '') {
  return controllerHandler('HEAD', path);
}

export function Options(path: string = '') {
  return controllerHandler('OPTIONS', path);
}

export function Patch(path: string = '') {
  return controllerHandler('PATCH', path);
}

export function Post(path: string = '') {
  return controllerHandler('POST', path);
}

export function Put(path: string = '') {
  return controllerHandler('PUT', path);
}

export function Delete(path: string = '') {
  return controllerHandler('DELETE', path);
}

// controller metadata parser

export function getCtxHandlersFromController(controller: Object) {
  const ctxHandlers = [] as RouteHandler[];

  const controllerHandlers = Reflect.getMetadata(
    sControllerHandlers,
    controller
  ) as Map<string | symbol, ControllerHandler>;

  if (!controllerHandlers || controllerHandlers.size === 0) {
    return ctxHandlers;
  }

  for (const ctrlHandler of controllerHandlers.values()) {
    const controllerHandler = controller[ctrlHandler.key] as () =>
      | Promise<any>
      | any;
    const ctxHandler = controllerHandler.bind(controller) as CtxHandler;

    const routeCtxHandler = {
      method: ctrlHandler.method,
      path: ctrlHandler.path,
      ctxHandler: ctxHandler,
    } as RouteHandler;
  }

  return ctxHandlers;
}
