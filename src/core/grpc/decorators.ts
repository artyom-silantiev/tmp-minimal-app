import { resolve } from 'path';
import { camelToSnake } from '../lib';
import { GRPCall, GrpcCallType, GrpcService, GrtcMiddleware } from './types';

export const sGrpcService = Symbol('sGrpcService');
export function gRpcService(params?: {
  protoFileName?: string;
  serviceName?: string;
  middlewares?: GrtcMiddleware[];
}) {
  return function (target: Function) {
    params = params || {};

    let serviceName = params.serviceName;
    if (!serviceName) {
      serviceName = target.name;
    }

    let protoFileName = params.protoFileName;
    if (!protoFileName) {
      let m = serviceName.match(/^(\w*)(Service){1}/);
      if (m) {
        protoFileName = camelToSnake(m[1]) + '.service';
      } else {
        protoFileName = camelToSnake(serviceName);
      }
    }

    if (!protoFileName.endsWith('.proto')) {
      protoFileName += '.proto';
    }

    const protoFile = resolve(__dirname, '../../../', 'grpc', protoFileName);

    const gRpcServiceMeta = {
      serviceName,
      protoFile,
      middlewares: params.middlewares || [],
    } as GrpcService;

    Reflect.defineMetadata(sGrpcService, gRpcServiceMeta, target);
  } as ClassDecorator;
}

//

export const sGrpcCall = Symbol('gRPC_Call');

function GrpcBaseDecorator(
  type: GrpcCallType,
  params?: {
    callName?: string;
    middlewares?: GrtcMiddleware[];
  }
) {
  return function (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    params = params || {};
    let callName: string;
    if (params.callName) {
      callName = params.callName;
    } else if (typeof key === 'string') {
      callName = key;
    } else {
      throw new Error('no value for call name');
    }

    if (!Reflect.hasMetadata(sGrpcCall, target)) {
      Reflect.defineMetadata(sGrpcCall, [], target);
    }

    const calls = Reflect.getMetadata(sGrpcCall, target) as GRPCall[];
    calls.push({
      callName,
      type,
      key,
      middlewares: params.middlewares || [],
    });

    return descriptor;
  } as MethodDecorator;
}

export function GrpcMethod(params?: {
  callName?: string;
  middlewares?: GrtcMiddleware[];
}) {
  return GrpcBaseDecorator(GrpcCallType.Method, params);
}

export function GrpcStreamMethod(params?: {
  callName?: string;
  middlewares?: GrtcMiddleware[];
}) {
  return GrpcBaseDecorator(GrpcCallType.StreamMethod, params);
}

export function GrpcStreamCall(params?: {
  callName?: string;
  middlewares?: GrtcMiddleware[];
}) {
  return GrpcBaseDecorator(GrpcCallType.StreamCall, params);
}
