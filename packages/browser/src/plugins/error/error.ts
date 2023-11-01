import { rewrite, type APMPlugin } from '@apm/core';
import { WINDOW } from '../../shared';
import { getPageUrl, getTimestamp } from '@apm/shared';
import { unknownErrorEvtToString } from '../../shared/utils';

const resourceMap = {
  img: '图片',
  js: 'JS脚本',
  css: 'CSS文件',
};

export function ApmErrorPlugin(): APMPlugin {
  return {
    name: 'apm-error-plugin',
    init(client) {
      const globalObject = WINDOW as unknown as { [key: string]: unknown };
      rewrite(globalObject, 'onerror', function (original): OnErrorEventHandler {
        return function (...opts) {
          const [ev, source, line, col, error] = opts;

          // 从错误信息中提取信息堆栈等等，在上传
          console.log(ev, source, 'ev, source', line, col, error);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          client.tracker(
            {
              type: 'error',
              subType: 'js',
              startTime: getTimestamp(),
              stack: error ? error.stack : '',
              msg: unknownErrorEvtToString(ev),
              column: col,
              pageURL: getPageUrl(),
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
          console.log(ev instanceof ErrorEvent, 'ddddddddddddd');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { error } = ev;
          if (ev instanceof ErrorEvent) {
            client.tracker(
              {
                type: 'error',
                subType: 'js',
                startTime: getTimestamp(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                stack: error ? error.stack : '',
                msg: unknownErrorEvtToString(ev.error as Event),
                column: ev.colno,
                pageURL: getPageUrl(),
              },
              'Error',
            );
          } else {
            client.tracker(
              {
                type: 'resource',
                pageURL: getPageUrl(),
                startTime: getTimestamp(),
                tagName: '',
                msg: '',
                url: '',
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

// function dd(ex) {
//   const chrome =
//       /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
//     gecko =
//       /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
//     winjs =
//       /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
//     // Used to additionally parse URL/line/column from eval frames
//     geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
//     chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/,
//     lines = ex.stack.split('\n'),
//     stack = [];

//   let submatch, parts, element;
//   // reference = /^(.*) is undefined$/.exec(ex.message)

//   for (let i = 0, j = lines.length; i < j; ++i) {
//     if ((parts = chrome.exec(lines[i]))) {
//       const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
//       const isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
//       if (isEval && (submatch = chromeEval.exec(parts[2]))) {
//         // throw out eval line/column and use top-most line/column number
//         parts[2] = submatch[1]; // url
//         parts[3] = submatch[2]; // line
//         parts[4] = submatch[3]; // column
//       }
//       element = {
//         url: !isNative ? parts[2] : null,
//         func: parts[1] || 'unknow function',
//         args: isNative ? [parts[2]] : [],
//         line: parts[3] ? +parts[3] : null,
//         column: parts[4] ? +parts[4] : null,
//       };
//     } else if ((parts = winjs.exec(lines[i]))) {
//       element = {
//         url: parts[2],
//         func: parts[1] || 'unknow function',
//         args: [],
//         line: +parts[3],
//         column: parts[4] ? +parts[4] : null,
//       };
//     } else if ((parts = gecko.exec(lines[i]))) {
//       const isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
//       if (isEval && (submatch = geckoEval.exec(parts[3]))) {
//         // throw out eval line/coluqqqqqqqqqqqqqqqqqqqqqqqqqqqqmn and use top-most line number
//         parts[3] = submatch[1];
//         parts[4] = submatch[2];
//         parts[5] = null; // no column when eval
//       } else if (i === 0 && !parts[5] && typeof ex.columnNumber !== 'undefined') {
//         // FireFox uses this awesome columnNumber property for its top frame
//         // Also note, Firefox's column number is 0-based and everything else expects 1-based,
//         // so adding 1
//         // NOTE: this hack doesn't work if top-most frame is eval
//         stack[0].column = ex.columnNumber + 1;
//       }
//       element = {
//         url: parts[3],
//         func: parts[1] || 'unknow function',
//         args: parts[2] ? parts[2].split(',') : [],
//         line: parts[4] ? +parts[4] : null,
//         column: parts[5] ? +parts[5] : null,
//       };
//     } else {
//       continue;
//     }

//     if (!element.func && element.line) {
//       element.func = 'unknow function';
//     }

//     stack.push(element);
//   }

//   console.log(stack, 'stack');
// }
