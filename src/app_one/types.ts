import express from 'express';
import { Ctx } from '@core/http/router';

export type AppReq = express.Request & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type AppCtx = Ctx & {
  req: AppReq;
};
