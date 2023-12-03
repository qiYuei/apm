import type { ApmClient } from '@apm/core';
import { createClient, type APMConfig, type APMPlugin, ApmError } from '@apm/core';
import { mergeConfigure } from '../shared/utils';
import type { ApmBrowserSenderConfigure } from '../sender/sender';
import { createSender } from '../sender/sender';
import { getDeviceInfo } from '../plugins';

export interface ApmBrowserMonitor {
  error?: boolean;
  route?: boolean;
  performance?: boolean;
}

export interface ApmBrowserConfigure {
  monitor: ApmBrowserMonitor;
  apmConfig: APMConfig;
  plugins?: ApmBrowserPlugin[];
  ready?: (client: ApmClient) => void;
  /** SenderConfigure */
  senderConfigure: ApmBrowserSenderConfigure;
}

export interface ApmBrowserPlugin extends APMPlugin {
  configure: (configure: ApmBrowserConfigure) => ApmBrowserConfigure | void;
}

function verify(params: Record<string, unknown>) {
  return fetch('/api/token', {
    method: 'post',
    body: JSON.stringify(params),
  })
    .then((r) => r.json())
    .then((res: Record<string, unknown>) => res.data as Record<string, string>)
    .catch((res) => {
      console.log(res);
      return false;
    });
}

export async function createBrowserClient(userConfigure: ApmBrowserConfigure) {
  const res: Record<'token', string> = await verify({
    platform: 'browser',
    devices: getDeviceInfo(),
  }).catch(() => {});

  console.log(res, '-------------------------');

  const defaultPlugins = [] as ApmBrowserPlugin[];

  const plugins = [...defaultPlugins, ...(userConfigure.plugins || [])];

  const configurePlugins = plugins.filter((plugins) => typeof plugins.configure === 'function');

  let configure = mergeConfigure(userConfigure);

  for (const plugin of configurePlugins) {
    const result = plugin.configure?.(configure);
    if (result) {
      configure = result;
    }
  }

  const client = createClient(configure.apmConfig, {
    senderFactory: createSender(configure, res.token),
  });

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

  return client;
}
