import bodyParser from 'body-parser';
import { createAppLogger } from './app-logger';
import { Application } from './core/application';
import { useCronService } from './core/cron';
import { useEnv } from './env/env';
import routes from './routes';
import { AppModule } from 'modules/app/app.module';

const logger = createAppLogger('App');

function bootstrap() {
  const env = useEnv();
  const app = new Application();

  app.upgrade((app) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
  });

  app.setRoutes(routes);

  app.listen(env.NODE_PORT, () => {
    useCronService(AppModule.cronService);

    logger.debug('dev env used');
    logger.log('env: ', env);
    logger.log(`app listen port: ${env.NODE_PORT}`);
  });
}

bootstrap();
