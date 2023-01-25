import express from 'express';
import { parseRouter, Router } from "./router";
import 'reflect-metadata';

export class Applaction {
  router = null as null | Router;

  setRouter(router: Router) {
    this.router = router;
  }

  listet(port: number, cb?: () => void) {
    const app = express();

    if (this.router) {
      parseRouter(this.router, app);
    }

    app.listen(port, cb);
  }
}
