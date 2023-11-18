import type { APMPlugin } from '@apm/core';
import { observer } from '../../shared/observer';
/**
 * First Paint,is the time between navigation and when the browser renders
 * the first pixels to the screen,
 * rendering anything that is visually different from what was on the screen prior
 * to navigation.
 * (https://developer.mozilla.org/en-US/docs/Glossary/First_paint)
 * */
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
