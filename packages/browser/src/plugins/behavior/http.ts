import { type MaybePromise, rewrite } from '@apm/core';
import { type HttpMethod, getTimestamp, type voidFun } from '@apm/shared';
import { WINDOW } from '../../shared';
import { getNetworkStatus } from '../../shared/browser';
import { httpTransform } from '../../shared/httpTransform';
import { resolveTiming } from '../../shared/timing';
import { on } from '../../shared/listeners';
import { type ApmBrowserPlugin } from '../../client/browser';

type IBeforeTrackerReturn = { state: 'success' | 'failed'; error?: string };

// 校验函数，检查给定的网址是否在白名单中
function checkWhitelist(url: string, whitelist: string[] | undefined): boolean {
  if (!whitelist || whitelist.length === 0) return false;
  const parsedURL = new URL(url);

  const pathname = parsedURL.pathname;
  const searchParams = parsedURL.search;

  return whitelist.some((item) => {
    if (item.startsWith('http')) {
      return url === item;
    }
    if (item.startsWith('/')) {
      const regex = new RegExp(`^${item}(\\?|$)`);
      return regex.test(pathname + searchParams);
    }
    return false;
  });
}

interface ITryCatchOptions {
  xhr: boolean;
  fetch: boolean;
  beforeTracker?: (
    response: Response,
    send: { url: string; config: Partial<Request> },
  ) => MaybePromise<IBeforeTrackerReturn | boolean | void>;
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

async function beforeSendHook(
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
    const result = await _opts?.beforeTracker(response, { url, config });
    if (result === false) return false;
    if (typeof result === 'object') {
      send = result;
      return send;
    }
  }
  return send;
}

export function requestPlugin(opts?: Partial<ITryCatchOptions>): ApmBrowserPlugin {
  const _opts: ITryCatchOptions = {
    xhr: true,
    fetch: true,
    ...opts,
    whiteList: opts?.whiteList || [],
  };

  return {
    name: 'apm-tryCatch-plugin',
    configure(configure) {
      _opts.whiteList?.push(configure.senderConfigure.url);
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

            on(this, 'loadend', async (e) => {
              if (checkWhitelist(url, _opts.whiteList)) return;
              const eTime = getTimestamp();
              const { target } = e;
              const { online, effectiveType } = getNetworkStatus();

              // if online false it mean user is off-line
              if (!online) return;

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              const response = new Response(target.responseText, { status: target.status });

              const send = await beforeSendHook(_opts, response, url, new Request(url, config));

              if (send === false) return;

              const timings = resolveTiming(
                'resource',
                (entry) => entry.initiatorType === 'xmlhttprequest' && entry.name === url,
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
                  timing: timings.length ? JSON.stringify(timings[timings.length - 1]) : 'unknown',
                  error: send.state !== 'success' ? send.error : '',
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
                if (checkWhitelist(url, _opts.whiteList)) return res;

                const tmpRes = res.clone();

                const eTime = getTimestamp();
                const { online, effectiveType } = getNetworkStatus();

                // if online false it mean user is off-line
                if (!online) return res;
                const send = await beforeSendHook(_opts, tmpRes, url, config);
                if (send === false) return res;

                const timings = resolveTiming(
                  'resource',
                  (entry) => entry.initiatorType === 'fetch' && entry.name === url,
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
                    message: send.error || httpTransform(tmpRes),
                    timing: timings.length
                      ? JSON.stringify(timings[timings.length - 1])
                      : 'unknown',
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
