import type { ApmBrowserConfigure } from '../client/browser';

export function mergeConfigure(userConfig: ApmBrowserConfigure): ApmBrowserConfigure {
  return {
    ...userConfig,
  };
}

export function unknownErrorEvtToString(evt: string | Event) {
  if (!evt) return '';
  if (typeof evt === 'string') return evt;

  return JSON.stringify(evt);
}
