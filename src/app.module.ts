import { useCronService } from '@core/cron';
import { defineModule } from '@core/module';
import { AppController } from './app.controller';
import { AppCronService } from './app_cron.service';

export const AppModule = defineModule((ctx) => {
  const appController = ctx.use(() => new AppController());
  const cronService = ctx.use(() => new AppCronService());

  ctx.onModuleInit(() => {
    useCronService(cronService);
  });

  return {
    appController,
    cronService,
  };
});
