import bodyParser from 'body-parser';
import { createAppLogger } from './app-logger';
import { Applaction } from "./core/applaction";
import { useCronService } from './core/cron';
import { CronService } from './cron.service';
import { useEnv } from './env/env';
import routes from './routes';

const logger = createAppLogger('App');

function bootstrap() {
  const env = useEnv();
  const app = new Applaction();

  app.upgrade((app) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
  });

  app.setRoutes(routes);

  app.listet(env.NODE_PORT, () => {
    logger.debug('dev env used');
    logger.log('env: ', env);
    logger.log(`app listen port: ${env.NODE_PORT}`);
  });

  useCronService(new CronService);
}

bootstrap();
