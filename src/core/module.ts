import { addModule } from './application';

type LifecycleHandler = () => Promise<void> | void;
type ModuleMeta = {
  items: any[];
  onModuleInitHandler: LifecycleHandler | null;
  onModuleDestroyHandler: LifecycleHandler | null;
};
export type ModuleWrap<T> = {
  moduleId: number;
  meta: ModuleMeta;
  module: T;
};

function getModuleSetupCtx(meta: ModuleMeta) {
  return {
    use<T>(factory: () => T) {
      const item = factory();
      meta.items.push(item);
      return item;
    },
    onModuleInit(handler: LifecycleHandler) {
      meta.onModuleInitHandler = handler;
    },
    onModuleDestroy(handler: LifecycleHandler) {
      meta.onModuleDestroyHandler = handler;
    },
  };
}
type ModuleSetupCtx = ReturnType<typeof getModuleSetupCtx>;

export type ModuleSetup<T> = (ctx: ModuleSetupCtx) => T;

let modulesCount = 0;
export function defineModule<T>(setup: ModuleSetup<T>) {
  const moduleId = modulesCount++;
  const meta = {
    items: [] as any[],
    onModuleInitHandler: null as null | { (): Promise<void> },
    onModuleDestroyHandler: null as null | { (): Promise<void> },
  };
  const moduleCtx = getModuleSetupCtx(meta);
  const moduleWrap = {
    moduleId,
    meta,
    module: setup(moduleCtx),
  };

  addModule(moduleWrap);

  return moduleWrap.module;
}
