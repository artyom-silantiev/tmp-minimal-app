import { gRPC_Call, gRPC_Service } from '@core/grpc';

@gRPC_Service('HelloService', 'hello.proto')
export class AppGRPC {
  @gRPC_Call('callHello')
  callHello() {
    return {
      message: 'Hello, gRPC!',
    };
  }
}
