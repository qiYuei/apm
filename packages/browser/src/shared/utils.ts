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

export function getPageUrl() {
  return window.location.href;
}

export function isSupportSendBeacon() {
  const isRealNavigator =
    Object.prototype.toString.call(window && window.navigator) === '[object Navigator]';
  return isRealNavigator && typeof window.navigator.sendBeacon === 'function';
}

export function isSupportFetch() {
  return /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(window.fetch.toString());
}
