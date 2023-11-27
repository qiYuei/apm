import type { APMPlugin } from '@apm/core';
import { observer } from '../../shared/observer';
/**
 * First Contentful Paint (FCP) is when the browser renders the first bit of content from the DOM,
 * providing the first feedback to the user that the page is actually loading
 * (https://developer.mozilla.org/en-US/docs/Glossary/First_contentful_paint)
 * */
export function fcp(): APMPlugin {
  return {
    name: 'performance-fcp-plugin',
    setup(client) {
      function entryHandler(list: PerformanceObserverEntryList) {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            client.tracker(
              {
                type: 'Performance',
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
