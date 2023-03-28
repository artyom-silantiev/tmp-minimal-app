import { metadata } from '@core/metadata';
import { CtxHandler, RouteHandler } from './router';

const sHttp = Symbol('sHttp');
const sHttpMiddlewares = Symbol('sHttpMiddlewares');
const sHttpHandlers = Symbol('sHttpHandlers');
const sHttpHandler = Symbol('sHttpHandler');
const sHttpHandlerMiddlewares = Symbol('sHttpHandlerMiddlewares');

// Controller decorator

export function Controller() {
  return function (target: Function) {
    metadata.set([target, sHttp], true);
  } as ClassDecorator;
}

// CtxMiddlewares decorator
export function CtxMiddlewares(middlewares: CtxHandler[]) {
  return function (target: any, key?: string | symbol) {
    if (key) {
      // method decorator
      metadata.set(
        [target.constructor, sHttpHandlers, key, sHttpHandlerMiddlewares],
        middlewares
      );
    } else {
      // class decorator
      metadata.set([target.constructor, sHttpMiddlewares], middlewares);
    }
  };
}

// Controller methods decorators
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
};

function httpHandler(method: Method, path: string) {
  return function (target: Object, key: string | symbol) {
    metadata.set([target.constructor, sHttpHandlers, key, sHttpHandler], {
      method,
      path,
      key,
      ctxMiddlewares: [],
    } as ControllerHandler);
  } as MethodDecorator;
}

export function All(path: string = '') {
  return httpHandler('ALL', path);
}

export function Get(path: string = '') {
  return httpHandler('GET', path);
}

export function Head(path: string = '') {
  return httpHandler('HEAD', path);
}

export function Options(path: string = '') {
  return httpHandler('OPTIONS', path);
}

export function Patch(path: string = '') {
  return httpHandler('PATCH', path);
}

export function Post(path: string = '') {
  return httpHandler('POST', path);
}

export function Put(path: string = '') {
  return httpHandler('PUT', path);
}

export function Delete(path: string = '') {
  return httpHandler('DELETE', path);
}

// controller metadata parser

export function getCtxHandlersFromController(controller: Object) {
  if (!metadata.has([controller.constructor, sHttp])) {
    return [] as RouteHandler[];
  }

  const httpHandlers = metadata.get([
    controller.constructor,
    sHttpHandlers,
  ]) as Map<string, any>;

  if (!httpHandlers || httpHandlers.size === 0) {
    return [] as RouteHandler[];
  }

  const routeHandlers = [] as RouteHandler[];

  for (const key of httpHandlers.keys()) {
    const httpHandler = metadata.get([
      controller.constructor,
      sHttpHandlers,
      key,
      sHttpHandler,
    ]) as ControllerHandler;

    const ctxHandler = controller[key].bind(controller) as CtxHandler;

    const routeCtxHandler = {
      method: httpHandler.method,
      path: httpHandler.path,
      ctxHandler: ctxHandler,
    } as RouteHandler;

    routeHandlers.push(routeCtxHandler);
  }

  return routeHandlers;
}
