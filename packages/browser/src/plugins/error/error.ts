import { rewrite, type APMPlugin } from '@apm/core';
import { WINDOW } from '../../shared';
import { getPageUrl, getTimestamp } from '@apm/shared';
import { getEventTrigger, unknownErrorEvtToString } from '../../shared/utils';
import { parseStackFrames } from '../../shared/resolveStack';

const resourceMap: Record<string, string> = {
  img: '图片',
  script: 'JS脚本',
  link: '资源文件',
};

export function ApmErrorPlugin(): APMPlugin {
  return {
    name: 'apm-error-plugin',
    setup(client) {
      const globalObject = WINDOW as unknown as { [key: string]: unknown };
      rewrite(globalObject, 'onerror', function (original): OnErrorEventHandler {
        return function (...opts) {
          const [ev, , row, col, error] = opts;
          // 从错误信息中提取信息堆栈等等，在上传
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          client.tracker(
            {
              type: 'error',
              subType: 'js',
              startTime: getTimestamp(),
              stack: parseStackFrames(error!),
              msg: unknownErrorEvtToString(ev as ErrorEvent),
              column: col,
              pageURL: getPageUrl(),
              line: row,
            },
            'Error',
          );
          if (typeof original === 'function') {
            original.apply(globalObject, opts);
          }
        };
      });

      window.addEventListener(
        'error',
        (ev: ErrorEvent) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { error } = ev as { error: Error };
          if (ev instanceof ErrorEvent) {
            client.tracker(
              {
                type: 'error',
                subType: 'js',
                startTime: getTimestamp(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                stack: parseStackFrames(error),
                msg: unknownErrorEvtToString(error),
                column: ev.colno,
                line: ev.lineno,
                pageURL: getPageUrl(),
              },
              'Error',
            );
          } else {
            const { tag, url, html } = getEventTrigger((ev as Event).target as HTMLElement);
            client.tracker(
              {
                type: 'resource',
                pageURL: getPageUrl(),
                startTime: getTimestamp(),
                tagName: tag,
                msg: `${resourceMap[tag]}: 加载失败`,
                url: url!,
                outHtml: html,
              },
              'Resource',
            );
          }
        },
        true,
      );

      // Promise Error
      window.addEventListener(
        'unhandledrejection',
        (ev) => {
          console.log(ev, 'Promise');
          client.tracker(
            {
              type: 'error',
              subType: 'Promise',
              msg: unknownErrorEvtToString(ev.reason as string),
              stack: parseStackFrames(ev.reason as Error),
              startTime: getTimestamp(),
              pageURL: getPageUrl(),
            },
            'Error',
          );
        },
        true,
      );
    },
  };
}
