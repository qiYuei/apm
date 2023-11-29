import type { ApmSeverity } from '@apm/shared';
import type { ApmClient } from '../client';
import { createDebugger } from '../utils/debug';
import type { ApmPerformanceSubType, ApmResourceSubType, ApmErrorSubType } from '../types';

interface ApmErrorStack {
  filename?: string;
  functionName?: string;
  lineno?: number;
  colno?: number;
}

export interface ApmErrorTracker {
  subType: ApmErrorSubType;
  type: 'Error';
  startTime: number;
  pageURL: string;
  msg: string;
  error_constructor: string;
  line?: number;
  column?: number;
  stack?: string | Array<ApmErrorStack>;
}

interface ApmResourceErrorTracker {
  type: 'Resource';
  subType: ApmResourceSubType;
  tagName: string;
  pageURL: string;
  startTime: number;
  src: string;
  msg: string;
  outHtml?: string;
}
interface ApmPerformanceTracker {
  type: 'Performance';
  subType: ApmPerformanceSubType;
  indicator: number;
  indicatorName: string;
}

export interface ApmPerformanceTimingTracker {
  type: 'Performance';
  subType: 'timing';
  /** 白屏时间 - 从请求开始到开始解析html首个字节时间 */
  FP: number;
  /** 首次可交互时间 - 浏览器解析完html并完成dom构建,还没有触发domContentLoad */
  TTI: number;
  /** 触发完 domContentLoad 事件 */
  DomReady: number;
  /** 触发完 load 事件 */
  Load: number;
  /** 首包时间 - 发送请求到接收首个字节 */
  FirstByte: number;
  /** dns 解析耗时 */
  DNS: number;
  /** tcp 连接耗时 */
  TCP: number;
  /** 只有 https 有效,其他都是 0  */
  SSL: number;
  /** 请求响应耗时 */
  TTFB: number;
  /** 内容传输耗时,此时请求已结束 */
  Trans: number;
  /** DOM解析耗时 */
  DOM: number;
  /** 资源加载耗时 */
  RES: number;
  /** 完整的timing */
  fullTiming: unknown;
}

export interface ApmTrackerType {
  Error: ApmErrorTracker;
  Resource: ApmResourceErrorTracker;
  Performance: ApmPerformanceTracker | ApmPerformanceTimingTracker;
  Custom: Record<string, unknown>;
}

export type ApmReportType = keyof ApmTrackerType;

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

    const result = await client.plugins.callBailHook('beforePush', transportData);

    if (result === false) return; // skip

    client.transport(transportData, opts.immediate);
  };
}
