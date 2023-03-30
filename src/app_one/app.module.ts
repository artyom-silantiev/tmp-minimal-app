import { AppGrpc } from './app.grpc';
import { AppController } from './app.controller';
import { AppCronService } from './app_cron.service';
import { defineModule } from 'minimal2b/module';

export const AppModule = defineModule((ctx) => {
  const appController = new AppController();
  const cronService = new AppCronService();
  const appGrpc = new AppGrpc();

  return ctx.useItems({
    appController,
    cronService,
    appGrpc,
  });
});
