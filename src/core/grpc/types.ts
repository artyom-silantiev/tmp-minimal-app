import * as grpc from '@grpc/grpc-js';

export type GrtcMiddleware = {
  (req: any, metadata: grpc.Metadata): void;
};
export type GrtcCallHandler = {
  (req: any, metadata: grpc.Metadata): any | Promise<any>;
};

export type GrpcServiceMeta = {
  serviceName: string;
  protoFile: string;
  middlewares?: GrtcMiddleware[];
};

export enum GrpcCallType {
  Method = 0,
  StreamMethod = 1,
  StreamCall = 2,
}
export type GRPCall = {
  callName: string;
  type: GrpcCallType;
  key: string | symbol;
  middlewares?: GrtcMiddleware[];
};
