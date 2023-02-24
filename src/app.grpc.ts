import { gRPC_Call, gRPC_Service } from '@core/grpc';
import { GrpcException } from '@core/catch_grpc_error';
import { validateDto } from '@core/validator';
import { LoginDto } from 'app.controller';

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

  @gRPC_Call()
  async callLogin(req) {
    const body = await validateDto(req, LoginDto);

    return {
      accessToken: (Math.random() * 1e6 + 1e6).toString(32),
    };
  }
}
