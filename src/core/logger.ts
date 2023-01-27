import * as moment from 'moment';

export class Logger {
  constructor(public name: string = '') { }

  prefix() {
    return `${moment.utc().format('YYYY-MM-DD HH:mm:ss')}${this.name ? ` [${this.name}]` : ''
      }`;
  }

  log(...args: any) {
    console.log(this.prefix(), ...args);
  }
  error(...args: any) {
    console.error(this.prefix(), ...args);
  }
}

export function createLogger(name) {
  return new Logger(name);
}
