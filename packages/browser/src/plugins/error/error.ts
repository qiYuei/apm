import { rewrite, type APMPlugin } from '@apm/core';
import { WINDOW } from '../../shared';

export function ApmErrorPlugin(): APMPlugin {
  return {
    name: 'apm-error-plugin',
    init(config, client) {
      const globalObject = WINDOW as unknown as { [key: string]: unknown };
      rewrite(globalObject, 'onerror', function (original): OnErrorEventHandler {
        return function (...opts) {
          const [ev, source, line, col, error] = opts;

          // 从错误信息中提取信息堆栈等等，在上传
          console.log(ev, source, 'ev, source', line, col, error);

          if (typeof original === 'function') {
            original.apply(globalObject, opts);
          }
        };
      });
    },
  };
}
