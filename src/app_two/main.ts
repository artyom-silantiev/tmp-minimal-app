import bodyParser from 'body-parser';
import { createAppLogger } from '@lib/app_logger';
import { useEnv } from '@lib/env/env';
import express from 'express';
import { defineApplication } from '@core/application';

const logger = createAppLogger('App');

defineApplication((ctx) => {
  const env = useEnv();
  const app = express();

  logger.debug('dev env used');
  logger.log('env: ', env);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello from app two!',
    });
  });

  ctx.onModuleInit(() => {
    app.listen(env.NODE_PORT, () => {
      logger.log(`app listen port: ${env.NODE_PORT}`);
    });
  });
}).run();
