import express from 'express';
import { Applaction } from "./core/applaction";
import { Controller, Get, Param, Query, Req } from "./core/controller";

const port = 3000;

const app = new Applaction();

@Controller()
class AppController {
  @Get()
  index(@Query() query) {
    if (query['name']) {
      return `Hello, ${query['name']}!`
    } else {
      return 'Hello, world!';
    }
  }

  @Get('by_name/:name')
  byName(@Param('name') name: string) {
    return `Hello, ${name}!`;
  }
}

app.setRouter({
  routes: [
    {
      path: '',
      controller: new AppController(),
    },
  ]
});

app.listet(port, () => {
  console.log(`app listen port: ${port} `);
});
