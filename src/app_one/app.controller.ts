import { IsString, MinLength } from 'class-validator';
import { AppCtx } from './types';
import { AuthGuard } from './guards';
import {
  Controller,
  Ctx,
  Get,
  HttpException,
  HttpMiddlewares,
} from 'minimal2b/http';
import { validateDto } from 'minimal2b/validator';

export class LoginDto {
  @IsString()
  @MinLength(5)
  login: string;

  @IsString()
  password: string;
}

@Controller()
export class AppController {
  @Get()
  index(ctx: Ctx) {
    if (ctx.query['name']) {
      return `Hello, ${ctx.query['name']}!`;
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
    throw new HttpException(
      {
        badError: 'WTF!',
        status: 'emmm... mb 400?!',
      },
      400
    );
  }

  @Get('login')
  async login(ctx: Ctx) {
    const body = await validateDto(ctx.query, LoginDto);

    console.log('body', body);

    return {
      accessToken: (Math.random() * 1e6 + 1e6).toString(32),
    };
  }

  @Get('user/profile')
  @HttpMiddlewares([AuthGuard])
  getProfile(ctx: AppCtx) {
    const user = ctx.req.user;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
