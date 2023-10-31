import { createDebugger } from '../utils/debug';
import { getTimestamp, type ApmReportType, type ApmSeverity } from '@apm/shared';
export interface ApmBreadcrumbConfigure {
  max?: number;
  beforePushBreadcrumb?: (data: BreadcrumbPushData, stack: BreadcrumbPushData[]) => boolean | void;
}

export interface BreadcrumbPushData {
  /**
   * 事件类型
   */
  type: ApmReportType;
  data: unknown;
  time?: number;
  level: ApmSeverity;
}

export class Breadcrumb {
  private configure: ApmBreadcrumbConfigure;
  private maxBreadcrumbs = 10;
  private stack: BreadcrumbPushData[] = [];
  debugger: (...args: unknown[]) => unknown;

  constructor(configure: ApmBreadcrumbConfigure | undefined) {
    if (configure) {
      this.configure = configure;
      this.maxBreadcrumbs = configure.max || 10;
    } else {
      this.configure = {};
    }

    this.debugger = createDebugger('apm:breadcrumb');
  }

  push(data: BreadcrumbPushData) {
    if (this.configure && typeof this.configure.beforePushBreadcrumb === 'function') {
      const result = this.configure.beforePushBreadcrumb(data, this.stack);
      if (result === false) return;
    }

    return this.immediatePush(data);
  }

  immediatePush(data: BreadcrumbPushData) {
    if (this.stack.length >= this.maxBreadcrumbs) {
      while (this.stack.length >= this.maxBreadcrumbs) {
        this.stack.shift();
      }
    }

    data.time = data.time || getTimestamp();

    this.stack.push(data);
    this.stack.sort((a, b) => a.time! - b.time!);

    return this.stack;
  }

  getStack(): BreadcrumbPushData[] {
    return this.stack;
  }

  flush() {
    this.stack = [];
  }
}
