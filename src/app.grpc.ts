import { gRPC, gRPC_Service } from '@core/grpc';
import { GrpcException } from '@core/catch_grpc_error';
import { validateDto } from '@core/validator';
import { LoginDto } from 'app.controller';

@gRPC_Service()
export class AppGrpc {
  @gRPC()
  callHello() {
    return {
      message: 'Hello, gRPC!',
    };
  }

  @gRPC()
  callPost(req) {
    return {
      message: `Hello, ${req.name}!`,
    };
  }

  @gRPC()
  callThow() {
    throw new GrpcException(
      {
        msg: 'Bad news everone',
      },
      10
    );
  }

  @gRPC()
  async callLogin(req) {
    const body = await validateDto(req, LoginDto);

    return {
      accessToken: (Math.random() * 1e6 + 1e6).toString(32),
    };
  }
}
