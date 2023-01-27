import { AppController } from "./app.controller";
import { Route } from "./core/router";
import { AuthGuard } from "./guards";
import { AppCtx } from "./types";

export default [
  {
    path: '',
    controller: new AppController(),
    subRoutes: [
      {
        path: 'guarded',
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
              }
            }
          },
        ]
      }
    ]
  },
] as Route[];
