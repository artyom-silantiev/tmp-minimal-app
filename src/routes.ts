import { Route } from './core/router';
import { AuthGuard } from './guards';
import { AppCtx } from './types';
import { AppModule } from 'modules/app/app.module';

export default [
  {
    path: 'api',
    controller: AppModule.appController,
  },
  {
    path: 'api/guarded',
    middlewares: [AuthGuard],
    ctxHandlers: [
      {
        path: 'user',
        method: 'GET',
        handler: (ctx: AppCtx) => {
          const user = ctx.req.user;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        },
      },
    ],
  },
  {
    path: '',
    static: {
      root: process.cwd() + '/public',
    },
  },
] as Route[];
