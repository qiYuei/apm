import type { ApmBrowserConfigure } from '../client/browser';

export function mergeConfigure(userConfig: ApmBrowserConfigure): ApmBrowserConfigure {
  return {
    ...userConfig,
  };
}

export function unknownErrorEvtToString(evt: string | Error | ErrorEvent) {
  if (!evt) return '';
  if (typeof evt === 'string') return evt;
  if (evt.message) return evt.message;
  return JSON.stringify(evt);
}

export function getEventTrigger(el: HTMLElement) {
  return {
    tag: el.tagName.toLowerCase(),
    url: el.getAttribute('src') || el.getAttribute('href'),
    html: el.outerHTML,
  };
}

export function isSupportPerformanceObserver() {
  return !!window.PerformanceObserver;
}
