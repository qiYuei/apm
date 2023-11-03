import type { APMPlugin } from '@apm/core';
import { isSupportPerformanceObserver } from '../../shared/utils';

export function fp(): APMPlugin {
  return {
    name: 'performance-fp-plugin',
    setup(client) {
      if (!isSupportPerformanceObserver()) return;

      const entryHandler = (list: PerformanceObserverEntryList) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            observer.disconnect();
          }
        }
      };

      const observer = new PerformanceObserver(entryHandler);

      // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。
      observer.observe({ type: 'paint', buffered: true });
    },
  };
}
