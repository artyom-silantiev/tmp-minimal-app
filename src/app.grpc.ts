import { gRPC, gRPC_Service, gRtcMiddleware, protos } from '@core/grpc';
import { RpcException } from '@core/catch_rpc_error';
import { validateDto } from '@core/validator';
import { LoginDto } from 'app.controller';
import * as grpc from '@grpc/grpc-js';
import { resolve } from 'path';
import * as fs from 'fs-extra';
import { useEnv } from 'lib/env/env';
import { AppGrpcClient, AppGrpcHandlers } from '../grpc/ts/AppGrpc';
import { holdBeforeFileExists } from 'lib';

const env = useEnv();

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
  hello(call) {
    return {
      message: `Hello, ${call.request.name || 'World'}!`,
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
  async login(call) {
    const body = await validateDto(call.request, LoginDto);

    return {
      accessToken: (Math.random() * 1e6 + 1e6).toString(32),
    };
  }

  @gRPC({
    middlewares: [rtcAuthGuard],
  })
  async getProfile(call, meta: Map<string, any>) {
    return meta.get('user');
  }

  @gRPC()
  startUpload(call) {
    const file = resolve(__dirname, '../', 'README.md');
    console.log(file);

    const ClientProto = protos['app_grpc.proto']
      .AppGrpc as grpc.ServiceClientConstructor;

    // @ts-ignore
    const client: AppGrpcClient = new ClientProto(
      'localhost:8080',
      grpc.credentials.createInsecure()
    );

    const clientCall = client.uploadFile(function (error, response) {
      if (error) {
        // console.error(error);
      } else {
        console.log('response: ', response);
      }
    });

    clientCall.write({
      info: {
        name: 'README.md',
      },
    });

    const rs = fs.createReadStream(file);
    rs.on('data', (chunk) => {
      clientCall.write({
        chunk: chunk,
      });
    });
    rs.on('end', () => {
      clientCall.end();
    });
  }

  @gRPC({})
  async uploadFile(call, meta: Map<string, any>) {
    fs.mkdirsSync(env.DIR_TEMP);
    const tmp = resolve(env.DIR_TEMP, Date.now().toString());
    const ws = fs.createWriteStream(tmp);
    let name = '';

    await new Promise((resolve, reject) => {
      call.on('data', (payload) => {
        console.log('payload', payload);
        if (payload.data === 'info') {
          name = payload.info.name;
        } else {
          ws.write(payload.chunk);
        }
      });
      call.on('end', () => {
        console.log('end');
        ws.end();
        resolve(true);
      });
    });

    const targetFile = resolve(env.DIR_TEMP, name);
    fs.removeSync(targetFile);
    fs.renameSync(tmp, targetFile);

    await holdBeforeFileExists(targetFile);
    const stat = fs.statSync(targetFile);
    return {
      size: stat.size,
    };
  }
}
