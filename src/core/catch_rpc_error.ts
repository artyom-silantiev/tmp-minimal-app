import * as grpc from '@grpc/grpc-js';
import { ValidateException } from './validator';

export class RpcException extends Error {
  constructor(public message: string | any, public status: grpc.status) {
    super();
  }
}

export function catchGrpcException(
  error: unknown,
  callback: (err: any) => void
) {
  if (error instanceof ValidateException) {
    error = new RpcException(error.message, grpc.status.INVALID_ARGUMENT);
  }

  if (error instanceof RpcException) {
    if (typeof error.message === 'string') {
      callback({
        message: error.message,
        status: error.status,
      });
    } else {
      callback({
        message: JSON.stringify(error.message),
        status: error.status,
      });
    }
  } else {
    callback({
      message: error,
      status: grpc.status.INTERNAL,
    });
  }
}
