import express from 'express';
import { Router, parseRouter } from "./router";
import 'reflect-metadata';
import { catchError } from './catch_error';

export class Applaction {
  private app = express();
  router = null as null | Router;

  setRouter(router: Router) {
    this.router = Object.assign(new Router, router);
  }

  upgrade(upgrade: (app: express.Application) => void) {
    upgrade(this.app);
  }

  listet(port: number, cb?: () => void) {
    if (this.router) {
      parseRouter(this.router, this.app, '', 0);
    }

    this.app.use(catchError);

    console.log();

    this.app.listen(port, cb);
  }
}
