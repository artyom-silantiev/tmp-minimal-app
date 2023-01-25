export const sController = Symbol('Controller');
export type Method = 'ALL' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'DELETE';
export type ControllerHandler = {
  method: Method;
  path: string;
  target: Object;
  key: string | symbol;
};
export const sControllerHandlers = Symbol('ControllerHandlers');

export function Controller() {
  return function (target: Function) {
  } as ClassDecorator;
}

function controllerHandler(method: Method, path: string) {
  return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
    if (!Reflect.hasMetadata(sControllerHandlers, target)) {
      Reflect.defineMetadata(sControllerHandlers, [], target);
    }

    const controllerHandlers = Reflect.getMetadata(sControllerHandlers, target) as ControllerHandler[];
    controllerHandlers.push({
      method, path, target, key
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

// Controller handler args

export type CtrlHandlerArgType = 'Req' | 'Param' | 'Query';
export const sCtrlHandlerArgs = Symbol('CtrlHandlerArgs');
export type CtrlHandlerArgs = {
  [key: string | symbol]: {
    type: CtrlHandlerArgType;
    data?: any;
  }[];
}

export function Req() {
  return function (target: Object, key: string | symbol, index: number) {
    if (!Reflect.hasMetadata(sCtrlHandlerArgs, target)) {
      Reflect.defineMetadata(sCtrlHandlerArgs, {}, target);
    }
    const ctrlHandlerArgs = Reflect.getMetadata(sCtrlHandlerArgs, target) as CtrlHandlerArgs;

    if (!ctrlHandlerArgs[key]) {
      ctrlHandlerArgs[key] = [];
    }
    const args = ctrlHandlerArgs[key];

    args[index] = {
      type: 'Req',
    };
  } as ParameterDecorator;
}

export function Param(paramName: string) {
  return function (target: Object, key: string | symbol, index: number) {
    if (!Reflect.hasMetadata(sCtrlHandlerArgs, target)) {
      Reflect.defineMetadata(sCtrlHandlerArgs, {}, target);
    }
    const ctrlHandlerArgs = Reflect.getMetadata(sCtrlHandlerArgs, target) as CtrlHandlerArgs;

    if (!ctrlHandlerArgs[key]) {
      ctrlHandlerArgs[key] = [];
    }
    const args = ctrlHandlerArgs[key];

    args[index] = {
      type: 'Param',
      data: paramName
    };
  } as ParameterDecorator;
}

export function Query(queryName?: string) {
  return function (target: Object, key: string | symbol, index: number) {
    if (!Reflect.hasMetadata(sCtrlHandlerArgs, target)) {
      Reflect.defineMetadata(sCtrlHandlerArgs, {}, target);
    }
    const ctrlHandlerArgs = Reflect.getMetadata(sCtrlHandlerArgs, target) as CtrlHandlerArgs;

    if (!ctrlHandlerArgs[key]) {
      ctrlHandlerArgs[key] = [];
    }
    const args = ctrlHandlerArgs[key];

    args[index] = {
      type: 'Query',
      data: queryName
    };
  } as ParameterDecorator;
}
