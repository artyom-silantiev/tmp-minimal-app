import {
  GrpcMethod,
  GrpcService,
  GrpcStreamCall,
  GrpcStreamMethod,
} from '@core/grpc/decorators';
import { createGrpcClient } from '@core/grpc/client';
import { GrtcMiddleware } from '@core/grpc/types';

import { RpcException } from '@core/catch_rpc_error';
import { validateDto } from '@core/validator';
import { LoginDto } from 'app.controller';
import * as grpc from '@grpc/grpc-js';
import { resolve } from 'path';
import * as fs from 'fs-extra';
import { useEnv } from 'lib/env/env';
import { AppGrpcClient } from '../grpc/ts/AppGrpc';
import { holdBeforeFileExists } from 'lib';
import { Stream } from 'stream';
import { ChatMsg, ChatMsg__Output } from '../grpc/ts/ChatMsg';

const env = useEnv();

const rtcAuthGuard: GrtcMiddleware = (req, metadata: grpc.Metadata) => {
  metadata.get('access-token');

  if (metadata.get('access-token')) {
    metadata.set('userId', '1');
    metadata.set('userName', 'Bob');
  } else {
    throw new RpcException('Forbidden', grpc.status.UNAUTHENTICATED);
  }
};

@GrpcService()
export class AppGrpc {
  client = createGrpcClient<AppGrpcClient>(
    'app_grpc.proto',
    'AppGrpc',
    'localhost:8080'
  );

  @GrpcMethod()
  hello(call) {
    return {
      message: `Hello, ${call.name || 'World'}!`,
    };
  }

  @GrpcMethod()
  throw() {
    throw new RpcException(
      {
        msg: 'Bad news everone',
      },
      10
    );
  }

  @GrpcMethod()
  async login(call) {
    const body = await validateDto(call, LoginDto);

    return {
      accessToken: (Math.random() * 1e6 + 1e6).toString(32),
    };
  }

  @GrpcMethod({
    middlewares: [rtcAuthGuard],
  })
  async getProfile(call, meta: grpc.Metadata) {
    return {
      userId: meta.get('userId'),
      name: meta.get('userName'),
    };
  }

  @GrpcMethod()
  async uploadFileTest() {
    const file = resolve(__dirname, '../', 'README.md');

    const res = await new Promise((resolve, reject) => {
      const clientCall = this.client.uploadFile(function (error, response) {
        if (error) {
          reject(error);
        } else {
          resolve(response);
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
    });

    return res;
  }

  @GrpcStreamCall()
  async uploadFile(stream: Stream) {
    fs.mkdirsSync(env.DIR_TEMP);
    const tmp = resolve(env.DIR_TEMP, Date.now().toString());
    const ws = fs.createWriteStream(tmp);
    let name = '';

    await new Promise((resolve, reject) => {
      stream.on('data', (payload) => {
        console.log('payload', payload);
        if (payload.data === 'info') {
          name = payload.info.name;
        } else {
          ws.write(payload.chunk);
        }
      });
      stream.on('end', () => {
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

  @GrpcMethod()
  async chatTest() {
    const client = this.client.chat();

    await new Promise((resolve, reject) => {
      client.write({
        msg: 1,
      });
      client.on('data', (chunk: ChatMsg__Output) => {
        console.log('bbb chunk', chunk);

        if (chunk.msg >= 10) {
          resolve(true);
        } else {
          client.write({
            msg: chunk.msg + 1,
          });
        }
      });
      client.on('error', (error) => {
        reject(error);
      });
      client.on('end', () => {
        console.log('bbb end');
        resolve(true);
      });
    });

    client.end();
    console.log('client chat call end');
  }

  @GrpcStreamMethod()
  async chat(client: grpc.ClientDuplexStream<ChatMsg, ChatMsg__Output>) {
    await new Promise((resolve, reject) => {
      client.on('data', (chunk: ChatMsg__Output) => {
        console.log('aaa chunk', chunk);
        client.write({
          msg: chunk.msg + 1,
        });
      });
      client.on('error', (error) => {
        reject(error);
      });
      client.on('end', () => {
        console.log('aaa end');
        resolve(true);
      });
    });

    client.end();
    console.log('server chat method end');
  }
}
