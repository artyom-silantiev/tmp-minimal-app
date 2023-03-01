import 'reflect-metadata';
import bodyParser from 'body-parser';
import { createAppLogger } from '@lib/app_logger';
import { useEnv } from '@lib/env/env';
import routes from './routes';
import express from 'express';
import { initAppRouter } from '@core/router';
import { catchHttpException } from '@core/catch_http_error';
import { createApp } from '@core/application';

const logger = createAppLogger('App');

createApp((ctx) => {
  const env = useEnv();
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  initAppRouter(app, routes);
  app.use(catchHttpException);

  ctx.onModuleInit(() => {
    app.listen(env.NODE_PORT, () => {
      logger.debug('dev env used');
      logger.log('env: ', env);
      logger.log(`app listen port: ${env.NODE_PORT}`);
    });
  });
});
