import type { APMPlugin, ApmPerformanceTimingTracker } from '@apm/core';
import { observer } from '../../shared/observer';

export function timeLine(): APMPlugin {
  return {
    name: 'performance-timeline-plugin',
    setup(client) {
      // const entry =
      //   performance.getEntriesByType('navigation').length > 0
      //     ? (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)
      //     : performance.timing;

      function entryHandler(list: PerformanceObserverEntryList) {
        console.log(list, '---------------------');

        list.getEntries().forEach((e) => {
          if (e.entryType === 'navigation') {
            const d = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            console.log(d.loadEventEnd, '-------------=== loadEventEnd');

            const entry = e as PerformanceNavigationTiming;
            const {
              fetchStart,
              responseStart,
              responseEnd,
              domInteractive,
              domContentLoadedEventEnd,
              loadEventStart,
              loadEventEnd,
              domainLookupStart,
              domainLookupEnd,
              connectEnd,
              connectStart,
              secureConnectionStart,
              requestStart,
            } = entry;

            console.log(loadEventEnd, '------------------', entry);
            const indicator: ApmPerformanceTimingTracker = {
              type: 'Performance',
              subType: 'timing',
              FP: responseEnd - fetchStart,
              TTI: domInteractive - fetchStart,
              DomReady: domContentLoadedEventEnd - fetchStart,
              Load: loadEventEnd - fetchStart,
              FirstByte: responseStart - domainLookupStart,
              DNS: domainLookupEnd - domainLookupStart,
              TCP: connectEnd - connectStart,
              SSL: secureConnectionStart > 0 ? connectEnd - secureConnectionStart : 0,
              TTFB: responseEnd - requestStart,
              Trans: responseEnd - responseStart,
              DOM: domInteractive - responseEnd,
              RES: loadEventStart - domContentLoadedEventEnd,
              fullTiming: entry,
            };

            client.tracker(indicator, 'Performance');
            watcher?.disconnect();
          }
        });
      }

      const watcher = observer('navigation', entryHandler);
    },
  };
}
