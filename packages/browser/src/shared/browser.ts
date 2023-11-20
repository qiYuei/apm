import { rewrite } from '@apm/core';

export type EventHandler<T extends keyof WindowEventMap> = (
  this: Window,
  event: WindowEventMap[T],
) => void;

export function clientState(cb: (state: DocumentReadyState) => void) {
  rewrite(document as unknown as Record<string, unknown>, 'onreadystatechange', (original) => {
    return (...args: unknown[]) => {
      cb(document.readyState);
      if (typeof original === 'function') {
        original.apply(document, args);
      }
    };
  });
}

export const beforeUnload = (callback: EventHandler<'beforeunload'>) => {
  window.addEventListener('beforeunload', callback);
};

export const unload = (callback: EventHandler<'unload'>) => {
  window.addEventListener('unload', callback);
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
