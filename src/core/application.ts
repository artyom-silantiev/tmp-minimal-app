import { onAppStart, parseItemForGRPC } from './grpc/server';
import { defineModule, ModuleSetup, modules } from './module';
import { useCronService } from './cron';

export function defineApplication<T>(setup: ModuleSetup<T>) {
  const appModule = defineModule(setup);

  async function run() {
    listenExit();

    for (const moduleWrap of modules) {
      for (const moduleItem of moduleWrap.meta.items) {
        if (
          typeof moduleItem === 'object' &&
          typeof moduleItem.onModuleInit === 'function'
        ) {
          await moduleItem.onModuleInit();
        }
      }

      moduleWrap.meta.items.forEach((item) => {
        parseItemForGRPC(item);
        useCronService(item);
      });
    }

    for (const moduleWrap of modules) {
      if (moduleWrap.meta.initHandler) {
        await moduleWrap.meta.initHandler();
      }
    }

    onAppStart();
  }

  return {
    module: appModule,
    run,
  };
}

function listenExit() {
  async function beforeExit() {
    for (const moduleWrap of modules) {
      for (const moduleItem of moduleWrap.meta.items) {
        if (
          typeof moduleItem === 'object' &&
          typeof moduleItem.onModuleDestroy === 'function'
        ) {
          await moduleItem.onModuleDestroy();
        }
      }
    }

    for (const moduleWrap of modules) {
      if (moduleWrap.meta.destroyHandler) {
        await moduleWrap.meta.destroyHandler();
      }
    }
  }

  async function exitHandler(evtOrExitCodeOrError: number | string | Error) {
    try {
      await beforeExit();
    } catch (e) {
      console.error('EXIT HANDLER ERROR', e);
    }

    process.exit(isNaN(+evtOrExitCodeOrError) ? 1 : +evtOrExitCodeOrError);
  }

  [
    'beforeExit',
    'uncaughtException',
    'unhandledRejection',
    'SIGHUP',
    'SIGINT',
    'SIGQUIT',
    'SIGILL',
    'SIGTRAP',
    'SIGABRT',
    'SIGBUS',
    'SIGFPE',
    'SIGUSR1',
    'SIGSEGV',
    'SIGUSR2',
    'SIGTERM',
  ].forEach((evt) => process.on(evt, exitHandler));
}
