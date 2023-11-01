import { createClient, type APMConfig, type APMPlugin } from '@apm/core';

export interface ApmBrowserMonitor {
  error?: boolean;
  route?: boolean;
  performance?: boolean;
}

export interface ApmBrowserConfigure {
  monitor: ApmBrowserMonitor;
  apmConfig: APMConfig;
  plugins?: APMPlugin[];
}

export function createBrowserClient(config: ApmBrowserConfigure) {
  const client = createClient(config.apmConfig);
}
