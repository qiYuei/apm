import { createDebugger } from '../utils/shared';

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

export type ApmTracker = <T extends keyof ApmTrackerType>(data: ApmTrackerOptions<T>) => void;

export function createTracker(): ApmTracker {
  const debug = createDebugger('apm:tracker');
  return function (data) {
    debug(`tracker data ->`, data);
  };
}
