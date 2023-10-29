import type { APMConfig } from '../client/client';
import type { MaybePromise } from '../types';
import { createDebugger } from '../utils/shared';

interface APMPluginHooks {
  init?: (config: APMConfig) => MaybePromise<void>;
  beforeRequest?: (request: RequestInfo) => MaybePromise<void>;
  afterRequest?: (request: RequestInfo) => MaybePromise<void>;
}

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
  plugins: APMPlugin[];
  pluginUtils: PluginHookUtils;
  constructor(plugins: APMPlugin[]) {
    this.plugins = plugins;

    this.pluginUtils = createPluginUtils(this.plugins);
  }

  async callHook<T extends keyof APMPluginHooks>(
    hook: T,
    ...opts: NonNullable<APMPluginHooks[T]> extends (...arg: infer U) => MaybePromise<void>
      ? U
      : never
  ) {
    // const plugins = this.pluginUtils.getPluginsHooks(hook);
    // for (const plugin of plugins) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   await plugin(...opts);
    // }
    const debug = createDebugger(`apm:plugin`);
    const plugins = this.pluginUtils.getPlugins(hook);

    for (const plugin of plugins) {
      console.log('11111111');
      debug(`calling ${plugin.name}`);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await plugin[hook](...opts);
    }
  }
}
