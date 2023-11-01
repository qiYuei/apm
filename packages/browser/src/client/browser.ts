import type { ApmClient } from '@apm/core';
import { createClient, type APMConfig, type APMPlugin, ApmError } from '@apm/core';
import { mergeConfigure } from '../shared/utils';

export interface ApmBrowserMonitor {
  error?: boolean;
  route?: boolean;
  performance?: boolean;
}

export interface ApmBrowserConfigure {
  monitor: ApmBrowserMonitor;
  apmConfig: APMConfig;
  plugins?: APMPlugin[];
  ready?: (client: ApmClient) => void;
}

export function createBrowserClient(userConfigure: ApmBrowserConfigure) {
  const defaultPlugins = [] as APMPlugin[];

  const plugins = [...defaultPlugins, ...(userConfigure.plugins || [])];

  const configurePlugins = plugins.filter((plugins) => typeof plugins.configure === 'function');

  let configure = mergeConfigure(userConfigure);

  for (const plugin of configurePlugins) {
    const result = plugin.configure<ApmBrowserConfigure>?.(configure);
    if (result) {
      configure = result;
    }
  }

  const client = createClient(configure.apmConfig);

  client.init(
    () => {
      // 调用callBack
      if (typeof configure.ready === 'function') {
        configure.ready(client);
      }
    },
    (e) => {
      client.transport(ApmError({ msg: 'sdk init fail', e }));
    },
  );
}
