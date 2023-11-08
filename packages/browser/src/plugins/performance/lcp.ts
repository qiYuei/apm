import type { APMPlugin } from '@apm/core';
import { observer } from '../../shared/observer';

export function lcp(): APMPlugin {
  return {
    name: 'performance-lcp-plugin',
    setup(client) {
      function handler(list: PerformanceObserverEntryList) {
        for (const entry of list.getEntries()) {
          if (entry.name === 'largest-contentful-paint') {
            client.tracker(
              {
                type: 'performance',
                indicatorName: entry.name,
                subType: 'LCP',
                indicator: entry.startTime,
              },
              'Performance',
            );
            watcher?.disconnect();
          }
        }
      }

      const watcher = observer('largest-contentful-paint', handler);
    },
  };
}
