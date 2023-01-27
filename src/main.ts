import 'reflect-metadata';
import bodyParser from 'body-parser';
import { createAppLogger } from './app-logger';
import { useEnv } from './env/env';
import routes from './routes';
import { AppModule } from 'modules/app/app.module';
import express from 'express';
import { initAppRouter } from '@core/router';
import { httpErrorCatch } from '@core/catch_error';

const logger = createAppLogger('App');

async function bootstrap() {
  const env = useEnv();
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  initAppRouter(app, routes);
  app.use(httpErrorCatch);

  await AppModule.init();

  app.listen(env.NODE_PORT, () => {
    logger.debug('dev env used');
    logger.log('env: ', env);
    logger.log(`app listen port: ${env.NODE_PORT}`);
  });
}

bootstrap();
