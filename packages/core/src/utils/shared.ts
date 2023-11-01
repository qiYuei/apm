import { getTimestamp } from '@apm/shared';
import type { BreadcrumbPushData } from '../client/breadcrumb';

export function ApmError(data: unknown): BreadcrumbPushData {
  return {
    type: 'Apm',
    level: 'critical',
    data,
    time: getTimestamp(),
  };
}

/** Returns 'obj' if it's the global object, otherwise returns undefined */
function isGlobalObj(obj: { Math?: Math }): unknown {
  return obj && obj.Math == Math ? obj : undefined;
}

export type GLOBAL_OBJType = {
  __Apm_config__?: Record<string, unknown>;
};

export const GLOBAL_OBJ: GLOBAL_OBJType =
  (typeof globalThis == 'object' && isGlobalObj(globalThis)) ||
  // eslint-disable-next-line no-restricted-globals
  (typeof window == 'object' && isGlobalObj(window)) ||
  (typeof self == 'object' && isGlobalObj(self)) ||
  (typeof global == 'object' && isGlobalObj(global)) ||
  (function (this: unknown) {
    return this;
  })() ||
  {};
