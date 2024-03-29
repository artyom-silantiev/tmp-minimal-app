import { HttpException } from 'minimal2b/http';
import { AppCtx } from './types';

export function AuthGuard(ctx: AppCtx) {
  if (!ctx.headers.authorization) {
    throw new HttpException('403', 403);
  }

  ctx.req.user = {
    id: '1337',
    name: 'User',
    email: 'user@this-app.io',
  };

  ctx.next();
}
