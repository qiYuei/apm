interface IPerformanceEntryMap {
  navigation: PerformanceNavigationTiming;
  resource: PerformanceResourceTiming;
  paint: PerformancePaintTiming;
}

export function resolveTiming<K extends keyof IPerformanceEntryMap>(
  entry: K,
  filter: (value: IPerformanceEntryMap[K], index: number) => boolean,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return performance.getEntriesByType(entry).filter(filter as any);
}
