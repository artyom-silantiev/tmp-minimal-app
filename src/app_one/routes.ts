import { Route } from '@core/http/types';
import { AppModule } from './app.module';

export default [
  {
    path: 'api',
    controller: AppModule.appController,
  },
  {
    path: '',
    static: {
      root: process.cwd() + '/public',
    },
  },
] as Route[];
