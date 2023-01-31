import { defineModule, ModuleSetup, ModuleWrap } from './module';

const modules = [] as ModuleWrap<unknown>[];

export function addAppModule<T>(moduleWrap: ModuleWrap<T>) {
  modules.push(moduleWrap);
}

export async function createApp<T>(setup: ModuleSetup<T>) {
  const appModule = defineModule(setup);

  for (const moduleWrap of modules) {
    if (moduleWrap.meta.initHandler) {
      await moduleWrap.meta.initHandler();
    }

    for (const moduleItem of moduleWrap.meta.items) {
      if (
        typeof moduleItem === 'object' &&
        typeof moduleItem.onModuleInit === 'function'
      ) {
        await moduleItem.onModuleInit();
      }
    }
  }

  return appModule;
}
