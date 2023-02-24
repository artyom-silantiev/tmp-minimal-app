import { gRPC, gRPC_Service, gRtcMiddleware } from '@core/grpc';
import { RpcException } from '@core/catch_rpc_error';
import { validateDto } from '@core/validator';
import { LoginDto } from 'app.controller';
import * as grpc from '@grpc/grpc-js';

const rtcAuthGuard: gRtcMiddleware = (req, metadata) => {
  if (metadata.has('access-token')) {
    metadata.set('user', {
      userId: '1',
      name: 'Bob',
    });
  } else {
    throw new RpcException('Forbidden', grpc.status.UNAUTHENTICATED);
  }
};

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
    throw new RpcException(
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

  @gRPC({
    middlewares: [rtcAuthGuard],
  })
  async getProfile(req, meta: Map<string, any>) {
    return meta.get('user');
  }
}
