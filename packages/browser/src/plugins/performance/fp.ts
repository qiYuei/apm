import type { APMPlugin } from '@apm/core';
import { observer } from '../../shared/observer';

export function fp(): APMPlugin {
  return {
    name: 'performance-fp-plugin',
    setup(client) {
      function entryHandler(list: PerformanceObserverEntryList) {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            client.tracker(
              {
                type: 'performance',
                subType: 'FP',
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
