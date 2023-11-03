import { isSupportPerformanceObserver } from './utils';

export function observer(
  type: string,
  handler: (watcher: PerformanceObserver) => (list: PerformanceObserverEntryList) => void,
) {
  if (!isSupportPerformanceObserver) return;

  const watcher = new PerformanceObserver(handler);

  watcher.observe({ type: type, buffered: true });
}
