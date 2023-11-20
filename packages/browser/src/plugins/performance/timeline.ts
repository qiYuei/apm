import type { APMPlugin, ApmPerformanceTimingTracker } from '@apm/core';
import { clientState } from '../../shared/browser';

export function timeLine(): APMPlugin {
  return {
    name: 'performance-timeline-plugin',
    setup(client) {
      clientState((state) => {
        if (state === 'complete') {
          const entry =
            performance.getEntriesByType('navigation').length > 0
              ? (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)
              : performance.timing;

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
          console.log(domContentLoadedEventEnd, 'domContentLoadedEventEnd');

          const indicator: ApmPerformanceTimingTracker = {
            type: 'timing',
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
        }
      });
    },
  };
}
