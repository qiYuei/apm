export function getPageUrl() {
  return window.location.href;
}

export function isSupportPerformanceObserver() {
  return !!window.PerformanceObserver;
}
export function isSupportSendBeacon() {
  const isRealNavigator =
    Object.prototype.toString.call(window && window.navigator) === '[object Navigator]';
  return isRealNavigator && typeof window.navigator.sendBeacon === 'function';
}

export function isSupportFetch() {
  return /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(window.fetch.toString());
}
