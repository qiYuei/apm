import type { ApmResourceSubType } from '@apm/core';
import { rewrite, type APMPlugin } from '@apm/core';
import { WINDOW } from '../../shared';
import { getPageUrl } from '../../shared/utils';
import { getEventTrigger, unknownErrorEvtToString } from '../../shared/utils';
import { parseStackFrames } from '../../shared/resolveStack';
import { getTimestamp } from '@apm/shared';
import { resolveErrorType } from '../../shared/resolveErrorType';

const resourceMap: Record<string, string> = {
  img: '图片',
  script: 'JS脚本',
  link: '资源文件',
};

// const fileReg = /\/(${w+}).${w+}?\?/g;

const tagAndFileTypeMap: Record<string, ApmResourceSubType> = {
  script: 'JS',
  img: 'IMAGE',
};

function parseFileType(tag: string, url: string | null): ApmResourceSubType {
  const match = tagAndFileTypeMap[tag];
  if (match) return match;

  if (!url) return 'OTHERS';
  // 尝试从url中解析
  return 'OTHERS';
}

export function ApmErrorPlugin(): APMPlugin {
  return {
    name: 'apm-error-plugin',
    setup(client) {
      const globalObject = WINDOW as unknown as { [key: string]: unknown };

      // 异步错误还是捕获不到

      // rewrite(globalObject, 'setTimeout', function (original) {
      //   return (fn, timeStamp) => {
      //     console.log('有没有走这里.........', fn.name, timeStamp);
      //     try {
      //       const res = original.apply(null, [fn, timeStamp]);

      //       return res;
      //     } catch (error) {
      //       console.log('setTimeout error', error);
      //     }
      //   };
      // });

      rewrite(globalObject, 'onerror', function (original): OnErrorEventHandler {
        return function (...opts) {
          const [ev, , row, col, error] = opts;
          // 从错误信息中提取信息堆栈等等，在上传
          const msg = unknownErrorEvtToString(ev as ErrorEvent);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          client.tracker(
            {
              type: 'Error',
              subType: 'JS',
              startTime: getTimestamp(),
              stack: parseStackFrames(error!),
              msg: msg,
              error_constructor: resolveErrorType(msg),
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
          console.log('error', ev);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const target: unknown = ev.target || ev.srcElement;
          const isElementTarget =
            target instanceof HTMLScriptElement ||
            target instanceof HTMLLinkElement ||
            target instanceof HTMLImageElement;
          // 防止被触发跟 onerror 一样的上报信息
          if (!isElementTarget) return false;

          const { tag, url, html } = getEventTrigger((ev as Event).target as HTMLElement);
          client.tracker(
            {
              type: 'Resource',
              pageURL: getPageUrl(),
              startTime: getTimestamp(),
              tagName: tag,
              msg: `${resourceMap[tag]}: 加载失败`,
              src: url!,
              outHtml: html,
              subType: parseFileType(tag, url),
            },
            'Resource',
          );
        },
        true,
      );

      // Promise Error
      window.addEventListener(
        'unhandledrejection',
        (ev) => {
          let error = ev as unknown;

          try {
            if ('reason' in ev) {
              error = ev.reason;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
            } else if ('detail' in ev && 'reason' in ev.detail) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              error = ev.detail.reason;
            }
          } catch (_oO) {
            // no-empty
          }

          client.tracker(
            {
              type: 'Error',
              subType: 'PROMISE',
              error_constructor: 'unhandledrejection',
              msg: unknownErrorEvtToString(error as string),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
              stack: parseStackFrames(error as any),
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
