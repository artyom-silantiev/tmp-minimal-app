import express from 'express';
import bodyParser from 'body-parser';
import { Applaction } from "./core/applaction";
import { Controller, Get, Post } from "./core/controller";
import { Ctx } from './core/router';
import { HttpExseption } from './core/catch_error';
import { IsString } from 'class-validator';
import { validateDto } from './core/validate';

const port = 3000;

class LoginDto {
  @IsString()
  login: string;

  @IsString()
  password: string;
}

@Controller()
class AppController {
  @Get()
  index(ctx: Ctx) {
    if (ctx.query['name']) {
      return `Hello, ${ctx.req.query['name']}!`
    } else {
      return 'Hello, world!';
    }
  }

  @Get('by_name/:name')
  byName(ctx: Ctx) {
    return `Hello, ${ctx.params.name}!`;
  }

  @Get('throw')
  getThrow(ctx: Ctx) {
    throw new HttpExseption({
      badError: 'WTF!',
      status: 'emmm... mb 400?!'
    }, 400);
  }

  @Get('login')
  async login(ctx: Ctx) {
    const body = await validateDto(ctx.query, LoginDto);

    console.log('body', body);

    ctx.res.json({
      accessToken: 'AWESOME 9000!'
    });
  }
}

const app = new Applaction();

app.upgrade((app) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
});

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
