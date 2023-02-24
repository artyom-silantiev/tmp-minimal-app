import { useCronService } from '@core/cron';
import { defineModule } from '@core/module';
import { AppGRPC } from 'app.grpc';
import { AppController } from './app.controller';
import { AppCronService } from './app_cron.service';

export const AppModule = defineModule((ctx) => {
  const appController = ctx.use(() => new AppController());
  const cronService = ctx.use(() => new AppCronService());
  const appGrpc = ctx.use(() => new AppGRPC());

  ctx.onModuleInit(() => {
    useCronService(cronService);
  });

  return {
    appController,
    cronService,
  };
});
