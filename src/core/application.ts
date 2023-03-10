import { onAppStart, parseItemForGRPC } from './grpc/server';
import { defineModule, ModuleSetup, modules } from './module';

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

    moduleWrap.meta.items.forEach((item) => {
      parseItemForGRPC(item);
    });
  }

  onAppStart();

  return appModule;
}
