import type { APMPlugin } from '@apm/core';
import { observer } from '../../shared/observer';

export function fcp(): APMPlugin {
  return {
    name: 'performance-fcp-plugin',
    setup(client) {
      function entryHandler(list: PerformanceObserverEntryList) {
        for (const entry of list.getEntries()) {
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
            watcher?.disconnect();
          }
        }
      }

      const watcher = observer('paint', entryHandler);
    },
  };
}
