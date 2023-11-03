import type { APMPlugin } from '@apm/core';
import { isSupportPerformanceObserver } from '../../shared/utils';

export function fcp(): APMPlugin {
  return {
    name: 'performance-fcp-plugin',
    setup(client) {
      if (!isSupportPerformanceObserver()) return;

      const entryHandler = (list: PerformanceObserverEntryList) => {
        for (const entry of list.getEntries()) {
          console.log('PerformanceObserver entry', entry);
          if (entry.name === 'first-contentful-paint') {
            client.tracker(
              {
                type: 'performance',
                subType: 'FCP',
                indicator: entry.startTime,
                indicatorName: entry.name,
              },
              'Performance',
            );
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
