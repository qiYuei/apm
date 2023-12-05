import type { ApmClient } from '@apm/core';
import { createClient, type APMConfig, type APMPlugin, ApmError } from '@apm/core';
import { mergeConfigure } from './config';
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
  plugins: ApmBrowserPlugin[];
  ready?: (client: ApmClient) => void;
  /** SenderConfigure */
  senderConfigure: ApmBrowserSenderConfigure;
}

export interface ApmBrowserPlugin extends APMPlugin {
  configure?: (configure: ApmBrowserConfigure) => ApmBrowserConfigure | void;
}

function init(params: Record<string, unknown>) {
  return fetch('/api/token', {
    method: 'post',
    body: JSON.stringify(params),
  })
    .then((r) => {
      if (r.ok === false) {
        return false;
      }
      return r.json();
    })
    .then((res: Record<string, unknown>) => res.data as Record<'token', string>)
    .catch((res) => {
      throw res;
    });
}

export async function createBrowserClient(userConfigure: ApmBrowserConfigure) {
  const ret = await init({
    platform: 'browser',
    devices: getDeviceInfo(),
  });

  if (!ret) return;
  // console.log(res, '-------------------------');

  let configure = mergeConfigure(userConfigure);

  const configurePlugins = configure.plugins.filter(
    (plugins) => typeof plugins.configure === 'function',
  );

  for (const plugin of configurePlugins) {
    const result = plugin.configure?.(configure);
    if (result) {
      configure = result;
    }
  }

  const client = createClient(
    Object.assign({}, userConfigure.apmConfig, {
      plugins: (userConfigure.plugins || [])?.concat(userConfigure.apmConfig.plugins || []),
    }),
    {
      senderFactory: createSender(configure, ret.token),
    },
  );

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
