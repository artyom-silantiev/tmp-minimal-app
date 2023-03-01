import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { resolve } from 'path';

export function createGrpcClient<T>(
  protoFileName: string,
  serviceName: string,
  addr: string
) {
  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  };
  const protoFile = resolve(__dirname, '../../../', 'grpc', protoFileName);

  const packageDefinition = protoLoader.loadSync(protoFile, options);
  const proto = grpc.loadPackageDefinition(packageDefinition) as any;

  const ClientProto = proto[serviceName] as grpc.ServiceClientConstructor;

  const client = new ClientProto(addr, grpc.credentials.createInsecure());

  return client as T;
}
