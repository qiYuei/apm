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
