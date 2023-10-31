import type { ApmClient } from '../client';
import { createDebugger } from '../utils/debug';

interface ApmErrorTracker {
  subType: 'resource' | 'js' | 'Promise';
  type: 'error';
  startTime: number;
  pageURL: string;
  msg: string;
  line?: string;
  column?: string;
  stack?: string;
}

export interface ApmTrackerType {
  error: ApmErrorTracker;
  custom: Record<string, unknown>;
}

export type ApmTrackerOptions<T extends keyof ApmTrackerType> = {
  type: T;
} & ApmTrackerType[T];

export type ApmTracker = <T extends keyof ApmTrackerType>(
  data: ApmTrackerOptions<T>,
) => Promise<void>;

export function createTracker(client: ApmClient): ApmTracker {
  const debug = createDebugger('apm:tracker');
  return async function (data, immediate = false) {
    debug(`tracker data ->`, data);

    const result = await client.plugins.callBailHook('beforeSend', data);

    if (result !== false) return; // skip

    if (immediate) {
      // 立即上报
    } else {
      // 延迟上报
    }
  };
}
