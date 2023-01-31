import 'reflect-metadata';
import bodyParser from 'body-parser';
import { createAppLogger } from './app_logger';
import { useEnv } from './env/env';
import routes from './routes';
import express from 'express';
import { initAppRouter } from '@core/router';
import { httpErrorCatch } from '@core/catch_error';
import { createApp } from '@core/application';

const logger = createAppLogger('App');

createApp((ctx) => {
  const env = useEnv();
  const app = express();

  logger.debug('dev env used');
  logger.log('env: ', env);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  initAppRouter(app, routes);
  app.use(httpErrorCatch);

  ctx.onModuleInit(() => {
    app.listen(env.NODE_PORT, () => {
      logger.log(`app listen port: ${env.NODE_PORT}`);
    });
  });
});
