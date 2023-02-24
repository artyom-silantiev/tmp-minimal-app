import * as grpc from '@grpc/grpc-js';

export class GrpcException {
  constructor(public message: string | any, public status: grpc.status) {}
}

export function catchGrpcException(
  error: unknown,
  callback: (err: any) => void
) {
  if (error instanceof GrpcException) {
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
