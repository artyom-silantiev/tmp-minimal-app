import { gRPC, gRPC_Service } from '@core/grpc';
import { GrpcException } from '@core/catch_grpc_error';
import { validateDto } from '@core/validator';
import { LoginDto } from 'app.controller';

@gRPC_Service()
export class AppGrpc {
  @gRPC()
  hello(req) {
    return {
      message: `Hello, ${req.name || 'World'}!`,
    };
  }

  @gRPC()
  throw() {
    throw new GrpcException(
      {
        msg: 'Bad news everone',
      },
      10
    );
  }

  @gRPC()
  async login(req) {
    const body = await validateDto(req, LoginDto);

    return {
      accessToken: (Math.random() * 1e6 + 1e6).toString(32),
    };
  }
}
