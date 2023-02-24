import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { resolve } from 'path';
import { catchGrpcException } from './catch_grpc_error';
import { camelToSnake } from './lib';
import { createLogger } from './logger';

export const sGrpcService = Symbol('sGrpcService');
type GrpcService = {
  serviceName: string;
  protoFile: string;
};
export function gRPC_Service(params?: {
  protoFileName?: string;
  serviceName?: string;
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

    const protoFile = resolve(__dirname, '../../', 'grpc', protoFileName);

    Reflect.defineMetadata(
      sGrpcService,
      {
        serviceName,
        protoFile,
      },
      target
    );
  } as ClassDecorator;
}

//

export const sGrpcCall = Symbol('gRPC_Call');
type GRPCall = {
  callName: string;
  key: string | symbol;
};
export function gRPC_Call(params?: { callName?: string }) {
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
      key,
    });

    return descriptor;
  } as MethodDecorator;
}

//

let grpcServer: grpc.Server;
const logger = createLogger('gRPC');

export function parseItemForGRPC(item: any) {
  const grpc = Reflect.getMetadata(
    sGrpcService,
    item.constructor
  ) as GrpcService;
  if (grpc) {
    const calls = Reflect.getMetadata(sGrpcCall, item);
    useGrpcService(grpc.serviceName, grpc.protoFile, item, calls);
  }
}

export function onAppStart() {
  if (grpcServer) {
    grpcServer.bindAsync(
      '127.0.0.1:50051',
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        console.log('gRPC server running at http://127.0.0.1:50051');
        grpcServer.start();
      }
    );
  }
}

function useGrpcService<T>(
  serviceName: string,
  protoFile: string,
  service: any,
  calls: GRPCall[]
) {
  if (!grpcServer) {
    grpcServer = new grpc.Server();
  }

  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };
  const packageDefinition = protoLoader.loadSync(protoFile, options);
  const proto = grpc.loadPackageDefinition(packageDefinition) as any;

  logger.log(`use gRPC service ${serviceName}`);

  const callsHandlers = {};
  calls.forEach((call) => {
    callsHandlers[call.callName] = async function (req, callback) {
      const handler = service[call.key];
      try {
        const res = await handler(req.request, req.metadata.internalRepr);
        callback(null, res);
      } catch (error) {
        catchGrpcException(error, callback);
      }
    };

    logger.log(`use gRPC call ${call.callName} for service ${serviceName}`);
  });

  grpcServer.addService(proto[serviceName].service, callsHandlers);
}
