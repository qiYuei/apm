import { rewrite } from '@apm/core';
import { type EventHandler, on } from './listeners';

export function clientState(cb: (state: DocumentReadyState) => void) {
  rewrite(document as unknown as Record<string, unknown>, 'onreadystatechange', (original) => {
    return (...args: unknown[]) => {
      cb(document.readyState);
      if (typeof original === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        original.apply(document, args);
      }
    };
  });
}

export const beforeUnload = (callback: EventHandler<'beforeunload'>) => {
  on(window, 'beforeunload', callback);
};

export const unload = (callback: EventHandler<'unload'>) => {
  on(window, 'unload', callback);
};

export type OnHiddenCallback = (event: Event) => void;

export const onHidden = (cb: OnHiddenCallback, once?: boolean) => {
  const onHiddenOrPageHide = (event: Event) => {
    if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
      cb(event);
      if (once) {
        window.removeEventListener('visibilitychange', onHiddenOrPageHide, true);
        window.removeEventListener('pagehide', onHiddenOrPageHide, true);
      }
    }
  };
  window.addEventListener('visibilitychange', onHiddenOrPageHide, true);
  // Some browsers have buggy implementations of visibilitychange,
  // so we use pagehide in addition, just to be safe.
  window.addEventListener('pagehide', onHiddenOrPageHide, true);
};

let firstHiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity;

export function getFirstHiddenTime() {
  onHidden((e) => {
    firstHiddenTime = Math.min(firstHiddenTime, e.timeStamp);
  }, true);

  return {
    get timeStamp() {
      return firstHiddenTime;
    },
  };
}

export const whenActivated = (callback: () => void) => {
  if (document.prerendering) {
    addEventListener('prerenderingchange', () => callback(), true);
  } else {
    callback();
  }
};

export function getNetworkStatus() {
  if (navigator.connection) {
    const { downlink, effectiveType, rtt } = navigator.connection;
    return {
      online: navigator.onLine,
      effectiveType: effectiveType,
      downlink: downlink,
      rtt: rtt,
    };
  }
  if (navigator.onLine !== undefined) {
    return {
      online: navigator.onLine,
      effectiveType: '未知',
    };
  }
  // 在某些情况下无法获取网络状态信息
  return {
    online: '未知',
    effectiveType: '未知',
  };
}

export function getLocationHref(): string {
  if (typeof document === 'undefined' || document.location == null) return '';
  return document.location.href;
}
