import type { ApmBrowserConfigure, ApmBrowserPlugin } from './browser';

const defaultPlugins = [] as ApmBrowserPlugin[];

export function mergeConfigure(userConfig: ApmBrowserConfigure): ApmBrowserConfigure {
  const plugins = userConfig.plugins || [];
  const ApmPlugin = userConfig.apmConfig.plugins || [];

  userConfig.apmConfig.plugins = [];

  return {
    ...userConfig,
    plugins: [...defaultPlugins, ...plugins, ...ApmPlugin],
  };
}
