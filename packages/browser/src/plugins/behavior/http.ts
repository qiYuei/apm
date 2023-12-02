import { rewrite, type APMPlugin } from '@apm/core';
import { type HttpMethod, getTimestamp, type voidFun } from '@apm/shared';
import { WINDOW } from '../../shared';
import { getNetworkStatus } from '../../shared/browser';
import { httpTransform } from '../../shared/httpTransform';
import { resolveTiming } from '../../shared/timing';
import { on } from '../../shared/listeners';

type IBeforeTrackerReturn = { state: 'success' | 'failed'; error?: string };

interface ITryCatchOptions {
  xhr: boolean;
  fetch: boolean;
  beforeTracker?: (
    res: Response,
    send: { url: string; config: Partial<Request> },
  ) => IBeforeTrackerReturn | boolean;
  whiteList?: string[];
}

type IFetch = (url: string, config: Partial<Request>) => Promise<Response>;

function getAjaxBody(body: unknown) {
  if (!body) return '';
  if (typeof body === 'string') return body;
  if (body instanceof FormData) {
    const form = {} as { [key: string]: unknown };
    body.forEach((value, key) => {
      form[key] = getAjaxBody(value);
    });
    return JSON.stringify(form);
  }
  if (body && typeof body === 'object') return JSON.stringify(body);
  return '';
}

function beforeSendHook(
  _opts: ITryCatchOptions,
  response: Response,
  url: string,
  config: Partial<Request>,
) {
  let send = {
    state: response.status === 200 ? 'success' : 'failed',
    error: undefined,
  } as IBeforeTrackerReturn;

  if (typeof _opts?.beforeTracker === 'function') {
    const result = _opts?.beforeTracker(response, { url, config });
    if (!result) return false;
    if (typeof result === 'object') {
      send = result;
      return send;
    }

    return false;
  }
  return send;
}

export function tryCatchPlugin(opts?: Partial<ITryCatchOptions>): APMPlugin {
  const _opts: ITryCatchOptions = {
    xhr: true,
    fetch: true,
    ...opts,
    whiteList: opts?.whiteList || [],
  };

  return {
    name: 'apm-tryCatch-plugin',
    configure(config: Record<string, any>) {
      _opts.whiteList?.push(config.url);
    },
    setup(client) {
      const globalObject = WINDOW as unknown as { [key: string]: unknown };

      if (_opts.xhr && 'XMLHttpRequest' in globalObject) {
        const oldXhrProto = XMLHttpRequest.prototype;
        rewrite(oldXhrProto, 'open', (original: voidFun) => {
          return function (this: XMLHttpRequest, method: string, url: string, ...args: unknown[]) {
            const sTime = getTimestamp();
            const config = {
              url,
              method,
            } as RequestInit;
            rewrite(oldXhrProto, 'send', (originalSend: voidFun) => {
              return function (this: XMLHttpRequest, body: any) {
                config.body = body;
                if (typeof originalSend === 'function') {
                  return originalSend.apply(this, [body]);
                }
              };
            });

            on(this, 'loadend', (e) => {
              const eTime = getTimestamp();
              const { target } = e;
              const { online, effectiveType } = getNetworkStatus();
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              const response = new Response(target.responseText, { status: target.status });

              const send = beforeSendHook(_opts, response, url, new Request(url, config));

              if (!(online && send !== false)) return;

              const timings = resolveTiming(
                'resource',
                (entry) => entry.initiatorType === 'xmlhttprequest',
              );

              client.tracker(
                {
                  type: 'Http',
                  subType: 'XHR',
                  input: url,
                  method: (config.method as HttpMethod) || 'GET',
                  body: getAjaxBody(config.body),
                  elapsedTime: eTime - sTime,
                  netWork: effectiveType,
                  state: send.state === 'success' ? 1 : 0,
                  startTime: getTimestamp(),
                  httpStatus: response.status,
                  message: httpTransform(response),
                  timing: JSON.stringify(timings[timings.length - 1]),
                },
                'Http',
              );
            });

            // 怎么理解js中的ArrayBufferView
            if (typeof original === 'function') {
              return original.apply(this, [method, url, args]);
            }
          };
        });
      }

      if (_opts.fetch && 'fetch' in globalObject) {
        rewrite(globalObject, 'fetch', (original: IFetch) => {
          return function (url: string, config: Partial<Request> = {}) {
            const sTime = getTimestamp();
            return original(url, config)
              .then(async (res) => {
                const tmpRes = res.clone();

                const eTime = getTimestamp();
                const { online, effectiveType } = getNetworkStatus();
                const send = beforeSendHook(_opts, tmpRes, url, config);

                // if online false it mean user is off-line
                if (!(online && send !== false)) return res;

                const timings = resolveTiming(
                  'resource',
                  (entry) => entry.initiatorType === 'fetch',
                );

                client.tracker(
                  {
                    type: 'Http',
                    subType: 'FETCH',
                    input: url,
                    method: (config.method as HttpMethod) || 'GET',
                    body: getAjaxBody(config.body),
                    elapsedTime: eTime - sTime,
                    netWork: effectiveType,
                    state: send.state === 'success' ? 1 : 0,
                    startTime: getTimestamp(),
                    httpStatus: tmpRes.status,
                    message: httpTransform(tmpRes),
                    timing: JSON.stringify(timings[timings.length - 1]),
                  },
                  'Http',
                );
                return res;
              })
              .catch((err) => {
                throw err;
              });
          };
        });
      }
    },
  };
}

// ['onload', 'onerror', 'onprogress', 'onreadystatechange'].forEach((prop) => {
//   if (prop in this) {
//     rewrite(this, prop, (originalFn: voidFun) => {
//       return function (this: XMLHttpRequest, ...args: unknown[]) {
//         try {
//           if (typeof originalFn === 'function') {
//             return originalFn.apply(this, args);
//           }
//         } catch (e) {
//           const msg = unknownErrorEvtToString(e as ErrorEvent);

//           client.tracker(
//             {
//               type: 'Error',
//               subType: 'XHR',
//               startTime: Date.now(),
//               error_constructor: resolveErrorType(msg),
//               stack: parseStackFrames(e as Error),
//               msg,
//               pageURL: getPageUrl(),
//             },
//             'Error',
//           );
//         }
//       };
//     });
//   }
// });
