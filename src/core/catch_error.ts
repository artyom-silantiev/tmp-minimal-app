import express from 'express';

export class HttpExseption extends Error {
  constructor(public message: string | any, public status: number) {
    super();
  }
}

export function catchError(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  if (err instanceof HttpExseption) {
    res.status(err.status)

    if (typeof err.message === 'string') {
      res.json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.json(err.message);
    }
  } else {
    res.status(500).send('Something went wrong');
  }
}
