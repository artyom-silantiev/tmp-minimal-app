import * as grpc from '@grpc/grpc-js';

export class GrtcMetadata {
  private metadata = {} as {
    [key: string]: any;
  };

  constructor(metadata: grpc.Metadata) {
    this.metadata = metadata.getMap();
  }

  has(key: string) {
    return typeof this.metadata[key] !== 'undefined';
  }

  get(key: string) {
    return this.metadata[key];
  }

  set(key: string, value: any) {
    this.metadata[key] = value;
  }

  delete(key: string) {
    delete this.metadata[key];
  }
}

export type GrtcMiddleware = {
  (req: any, metadata: GrtcMetadata): void;
};
export type GrtcCallHandler = {
  (req: any, metadata: GrtcMetadata): any | Promise<any>;
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
