import { isSupportPerformanceObserver } from './utils';

export function observer(type: string, handler: (list: PerformanceObserverEntryList) => void) {
  if (!isSupportPerformanceObserver) return;

  const watcher = new PerformanceObserver(handler);

  // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。

  watcher.observe({ type: type, buffered: true });

  return watcher;
}
