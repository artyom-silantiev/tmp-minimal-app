import { Logger } from '@core/logger';
import { useEnv } from './env/env';

const isDev = useEnv().isDevEnv();

export class AppLogger extends Logger {
  constructor(name: string) {
    super(name);
  }

  debug(...args: any) {
    if (isDev) {
      console.log(this.prefix(), ...args);
    }
  }
}

export function createAppLogger(name: string) {
  return new AppLogger(name);
}
