import type { BreadcrumbPushData } from '../client/breadcrumb';
import type { ApmClient } from '../client/client';
import type { MaybePromise } from '../types';
import { createDebugger } from '../utils/debug';

interface ApmParallelHook {
  setup?: (client: ApmClient) => MaybePromise<void>;
  destroy?: (client: ApmClient) => MaybePromise<void>;
}

interface ApmBailHook {
  beforePush?: (sendData: BreadcrumbPushData) => MaybePromise<void | boolean>;
}

interface ApmSerialHook {
  configure?: (config: any) => any;
}

type APMPluginHooks = ApmParallelHook & ApmBailHook & ApmSerialHook;

export interface APMPlugin extends APMPluginHooks {
  name: string;
}

interface PluginHookUtils {
  getPlugins(hookName: keyof APMPluginHooks): APMPlugin[];
  getPluginsHooks<K extends keyof APMPluginHooks>(hookName: K): NonNullable<APMPluginHooks[K]>[];
}

function normalizePlugin(hookName: keyof APMPluginHooks, plugins: APMPlugin[]) {
  const r: APMPlugin[] = [];
  for (const plugin of plugins) {
    const hook = plugin[hookName];
    // 这里还可以根据插件执行顺序进行排序 , 目前没实现
    if (hook && typeof hook === 'function') {
      r.push(plugin);
    }
  }
  return r;
}

export function createPluginUtils(plugins: APMPlugin[]): PluginHookUtils {
  const pluginsCache = new Map<keyof APMPluginHooks, APMPlugin[]>();

  function getPlugins(hookName: keyof APMPluginHooks) {
    if (pluginsCache.has(hookName)) {
      return pluginsCache.get(hookName)!;
    }
    const cache = normalizePlugin(hookName, plugins);
    pluginsCache.set(hookName, cache);
    return cache;
  }

  function getPluginsHooks<K extends keyof APMPluginHooks>(
    hookName: K,
  ): NonNullable<APMPluginHooks[K]>[] {
    const plugins = getPlugins(hookName);
    if (!plugins) {
      return [];
    }
    return plugins
      .map((plugin) => {
        const hook = plugin[hookName]!;
        return hook;
      })
      .filter(Boolean);
  }

  return {
    getPlugins,
    getPluginsHooks,
  };
}

export class PluginManger {
  private plugins: APMPlugin[];
  pluginUtils: PluginHookUtils;
  debug: (...args: unknown[]) => unknown;
  constructor(plugins: APMPlugin[]) {
    this.plugins = plugins;

    this.pluginUtils = createPluginUtils(this.plugins);
    this.debug = createDebugger(`apm:plugin`);
  }

  async callParallelHook<T extends keyof ApmParallelHook>(
    hook: T,
    ...opts: NonNullable<ApmParallelHook[T]> extends (...arg: infer U) => MaybePromise<unknown>
      ? U
      : never
  ) {
    const plugins = this.pluginUtils.getPlugins(hook).map((plugin) => {
      this.debug(`Parallel calling ${plugin.name} plugin`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return plugin[hook](...opts);
    });
    await Promise.all(plugins);
  }

  async callBailHook<T extends keyof ApmBailHook>(
    hook: T,
    ...opts: NonNullable<ApmBailHook[T]> extends (...arg: infer U) => MaybePromise<unknown>
      ? U
      : never
  ) {
    const plugins = this.pluginUtils.getPlugins(hook);

    for (const plugin of plugins) {
      this.debug(`Bail calling ${plugin.name} plugin`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = await plugin[hook](...opts);
      if (result === false) return false;
    }
  }
}
