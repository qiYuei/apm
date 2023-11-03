import type { ApmSeverity, ApmReportType } from '@apm/shared';
import type { ApmClient } from '../client';
import { createDebugger } from '../utils/debug';
import type { ApmPerformanceSubType, ApmResourceSubType, ApmErrorSubType } from '../types';

interface ApmErrorStack {
  filename?: string;
  functionName?: string;
  lineno?: number;
  colno?: number;
}

interface ApmErrorTracker {
  subType: ApmErrorSubType;
  type: 'error';
  startTime: number;
  pageURL: string;
  msg: string;
  line?: number;
  column?: number;
  stack?: string | Array<ApmErrorStack>;
}

interface ApmResourceErrorTracker {
  type: 'resource';
  subType: ApmResourceSubType;
  tagName: string;
  pageURL: string;
  startTime: number;
  url: string;
  msg: string;
  outHtml?: string;
}
interface ApmPerformanceTracker {
  type: 'performance';
  subType: ApmPerformanceSubType;
  indicator: number;
  indicatorName: string;
}

export interface ApmTrackerType {
  error: ApmErrorTracker;
  resource: ApmResourceErrorTracker;
  performance: ApmPerformanceTracker;
  custom: Record<string, unknown>;
}

export type ApmTrackerOptions<T extends keyof ApmTrackerType> = {
  type: T;
} & ApmTrackerType[T];

export type ApmTracker = <T extends keyof ApmTrackerType>(
  data: ApmTrackerOptions<T>,
  transportType: ApmReportType,
  opts?: {
    immediate?: boolean;
    level?: ApmSeverity;
  },
) => Promise<void>;

export function createTracker(client: ApmClient): ApmTracker {
  const debug = createDebugger('apm:tracker');
  return async function (data, transportType, opts = {}) {
    debug(`tracker data ->`, data);

    const options = Object.assign({ immediate: false, level: 'low' }, opts);

    const transportData = {
      data,
      type: transportType,
      level: options.level,
    };

    const result = await client.plugins.callBailHook('beforeSend', transportData);

    if (result === false) return; // skip

    client.transport(transportData, opts.immediate);
  };
}
