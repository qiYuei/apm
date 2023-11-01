import type { ApmBrowserConfigure } from '../client/browser';

export function mergeConfigure(userConfig: ApmBrowserConfigure): ApmBrowserConfigure {
  return {
    ...userConfig,
  };
}
