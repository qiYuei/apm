import { rewrite } from '@apm/core';
import type { ApmBrowserPlugin } from '../../client/browser';
import type { voidFun } from '@apm/shared';
import { WINDOW } from '../../shared';
import { getLocationHref } from '../../shared/browser';
import { on } from '../../shared/listeners';

let lastHref = '';
export function routePlugin(): ApmBrowserPlugin {
  return {
    name: 'apm-route-plugin',
    setup(client) {
      const globalObject = WINDOW as unknown as { [key: string]: unknown };

      // 因为 hashchange 也会触发 popstate 而且会先触发 popstate 所以只需要监听 popstate 即可
      function popstateHandler() {
        const to = getLocationHref();
        const from = lastHref;
        lastHref = to;

        handler(to, from);
      }
      function handler(to: string, from: string) {
        client.tracker({ type: 'Route', to, from }, 'Route');
      }

      on(window, 'popstate', popstateHandler);

      rewrite(globalObject, 'onpopstate', (original: voidFun) => {
        return function (this: Window, e: PopStateEvent) {
          popstateHandler();
          if (typeof original === 'function') {
            return original.apply(this, [e]);
          }
        };
      });
      rewrite(history, 'pushState', historyWrapFn);
      rewrite(history, 'replaceState', historyWrapFn);

      function historyWrapFn(original: voidFun): voidFun {
        return function (this: History, ...args: any[]): void {
          const url = args.length > 2 ? args[2] : undefined;
          if (url) {
            const from = lastHref;
            const to = String(url);
            lastHref = to;
            handler(to, from);
          }
          return original.apply(this, args);
        };
      }
    },
  };
}
