import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { catchGrpcException } from '../catch_rpc_error';
import { createLogger } from '../logger';
import { sGrpcCall, sGrpcService } from './decorators';
import { GRPCall, GrpcCallType, GrpcService, GrtcMiddleware } from './types';

let grpcServer: grpc.Server;
let globalMiddlewares = [] as GrtcMiddleware[];
const logger = createLogger('gRPC');

export function parseItemForGRPC(item: any) {
  const grpc = Reflect.getMetadata(
    sGrpcService,
    item.constructor
  ) as GrpcService;
  if (grpc) {
    const calls = Reflect.getMetadata(sGrpcCall, item);
    useGrpcService(grpc, item, calls);
  }
}

export function onAppStart() {
  if (grpcServer) {
    grpcServer.bindAsync(
      '127.0.0.1:8080',
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        console.log(`gRPC server running at http://127.0.0.1:${port}`);
        grpcServer.start();
      }
    );
  }
}

function useGrpcService<T>(
  grpcServiceMeta: GrpcService,
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
  const { protoFile, serviceName } = grpcServiceMeta;
  const serviceMiddlewares = grpcServiceMeta.middlewares;

  const packageDefinition = protoLoader.loadSync(protoFile, options);
  const proto = grpc.loadPackageDefinition(packageDefinition) as any;

  logger.log(`use gRPC service ${serviceName}`);

  const callsHandlers = {};
  calls.forEach((call) => {
    callsHandlers[call.callName] = async function (req, callback) {
      try {
        for (const middleware of globalMiddlewares) {
          middleware(req.request, req.metadata);
        }
        for (const middleware of serviceMiddlewares as GrtcMiddleware[]) {
          middleware(req.request, req.metadata);
        }
        for (const middleware of call.middlewares as GrtcMiddleware[]) {
          middleware(req.request, req.metadata);
        }
      } catch (error) {
        catchGrpcException(error, callback);
      }

      const handler = service[call.key].bind(service);
      try {
        if (call.type === GrpcCallType.Method) {
          const res = await handler(req.request, req.metadata);
          callback(null, res);
        } else if (call.type === GrpcCallType.StreamCall) {
          const res = await handler(req, req.metadata);
          callback(null, res);
        } else if (call.type === GrpcCallType.StreamMethod) {
          // TODO
        }
      } catch (error) {
        catchGrpcException(error, callback);
      }
    };

    logger.log(`use gRPC call ${call.callName} for service ${serviceName}`);
  });

  grpcServer.addService(proto[serviceName].service, callsHandlers);
}

export function setGlobalRtcMiddlweares(middlewares: GrtcMiddleware[]) {
  globalMiddlewares = middlewares;
}
