import bodyParser from 'body-parser';
import { Applaction } from "./core/applaction";
import { Controller, Get } from "./core/controller";
import { Ctx } from './core/router';
import { HttpException } from './core/catch_error';
import { IsString } from 'class-validator';
import { validateDto } from './core/validate';

const port = 3000;
const accessToken = 'AWESOME-9000!';

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
      return `Hello, ${ctx.query['name']}!`
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
    throw new HttpException({
      badError: 'WTF!',
      status: 'emmm... mb 400?!'
    }, 400);
  }

  @Get('login')
  async login(ctx: Ctx) {
    const body = await validateDto(ctx.query, LoginDto);

    console.log('body', body);

    return {
      accessToken,
    };
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
    {
      path: 'guarded',
      middlewares: [
        (req, res, next) => {
          if (!req.headers.authorization || req.headers.authorization !== accessToken) {
            throw new HttpException('403', 403);
          }
          next();
        }
      ],
      ctxHandlers: [
        {
          path: 'user',
          method: 'GET',
          handler: () => {
            return {
              id: 1337,
              name: '<some name>',
              email: 'some.name@example.com',
            }
          }
        }
      ]
    }
  ]
});

app.listet(port, () => {
  console.log(`app listen port: ${port} `);
});
