import type { APMPlugin } from '@apm/core';

export function lcp(): APMPlugin {
  return {
    name: 'performance-fcp-plugin',
    setup(client) {},
  };
}
