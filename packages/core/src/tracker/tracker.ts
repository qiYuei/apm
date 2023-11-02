import type { ApmSeverity, ApmReportType } from '@apm/shared';
import type { ApmClient } from '../client';
import { createDebugger } from '../utils/debug';

interface ApmErrorStack {
  filename?: string;
  functionName?: string;
  lineno?: number;
  colno?: number;
}

interface ApmErrorTracker {
  subType: 'js' | 'Promise';
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
  tagName: string;
  pageURL: string;
  startTime: number;
  url: string;
  msg: string;
  outHtml?: string;
}

export interface ApmTrackerType {
  error: ApmErrorTracker;
  resource: ApmResourceErrorTracker;
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

    const result = await client.plugins.callBailHook('beforeSend', data);

    if (result === false) return; // skip

    client.transport(
      {
        data,
        type: transportType,
        level: options.level,
      },
      opts.immediate,
    );
  };
}
