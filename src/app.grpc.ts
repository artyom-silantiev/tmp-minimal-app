import { gRPC_Call, gRPC_Service } from '@core/grpc';
import { GrpcException } from '@core/catch_grpc_error';

@gRPC_Service()
export class AppGrpc {
  @gRPC_Call()
  callHello() {
    return {
      message: 'Hello, gRPC!',
    };
  }

  @gRPC_Call()
  callPost(req) {
    return {
      message: `Hello, ${req.name}!`,
    };
  }

  @gRPC_Call()
  callThow() {
    throw new GrpcException(
      {
        msg: 'Bad news everone',
      },
      10
    );
  }
}
