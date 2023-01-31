import { IsString } from 'class-validator';
import { Controller, Get } from '@core/controller';
import { Ctx } from '@core/router';
import { HttpException } from '@core/catch_error';
import { validateDto } from '@core/validator';

class LoginDto {
  @IsString()
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
}
