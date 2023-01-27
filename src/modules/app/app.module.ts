import { useCronService } from '@core/cron';
import { AppController } from './app.controller';
import { CronService } from './cron.service';

export const AppModule = (() => {
  return {
    appController: new AppController(),
    cronService: new CronService(),

    async init() {
      useCronService(this.cronService);
    },
  };
})();
