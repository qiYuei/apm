import type { APMPlugin } from '@apm/core';
import { observer } from '../../shared/observer';
/**
 * Why not First Meaningful Paint (FMP)
 * In the past we've recommended performance metrics like First Meaningful Paint (FMP) and Speed Index (SI) (both available
 * in Lighthouse) to help capture more of the loading experience after the initial paint,
 * but these metrics are complex, hard to explain,
 * and often wrong—meaning they still do not identify when the main content of the page has loaded.
 * (https://web.dev/lcp/)
 *
 * The Largest Contentful Paint (LCP) metric reports the render time of the largest image or text block visible within the viewport,
 * relative to when the page first started loading.
 * */
export function lcp(): APMPlugin {
  return {
    name: 'performance-lcp-plugin',
    setup(client) {
      function handler(list: PerformanceObserverEntryList) {
        for (const entry of list.getEntries()) {
          if (entry.name === 'largest-contentful-paint') {
            client.tracker(
              {
                type: 'Performance',
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
