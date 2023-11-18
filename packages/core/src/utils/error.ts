/**
 *  创建错误id 重复错误可以选择忽略
 *
 */

import type { ApmErrorTracker } from '../tracker';

export function createErrorEventId(error: ApmErrorTracker): string {
  const { subType, stack = [], column, line, msg } = error;

  // 对于这些方法正确是采用hash 得到一个摘要.目前先简单处理
  const stringStack = Array.isArray(stack) ? stack.join('') : stack;

  return hashCode(`${subType}-${column}_${line}-${msg}__${stringStack}`);
}

export function hashCode(str: string): string {
  let hash = 0;
  if (str.length == 0) return String(hash);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return String(hash);
}
