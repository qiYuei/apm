import { createClient, type ApmClient } from '@apm/core'
import { getPageUrl } from '@apm/shared'
import { ApmErrorPlugin, createBrowserClient, ApmDevicePlugin } from '@apm/browser'
const client = createBrowserClient({
  monitor: {
    error: true
  },

  apmConfig: {
    senderConfigure: {
      mode: 'fetch',
      url: 'xxxxx'
    },
    plugins: [
      (() => {
        return {
          name: '@apm/plugin-test',
          configure(config) {},
          setup(config) {
            console.log('init', config)
          }
        }
      })(),
      (() => {
        let client: ApmClient
        function sourceError(e: ErrorEvent) {
          console.log('load source error', e)
        }

        function unCatchPromiseError(e: PromiseRejectionEvent) {
          console.log('unCatch Promise error', e)
          client.tracker(
            {
              type: 'error',
              subType: 'Promise',
              msg: e.reason,
              stack: e.reason.stack,
              startTime: e.timeStamp,
              pageURL: getPageUrl()
            },
            'Error'
          )
        }

        return {
          name: '@apm/plugin-test22222',
          setup(clientInstance) {
            console.log('ioooooooooooooooooooooooooooooooo')
            client = clientInstance
            // 捕获资源加载失败错误 js css img...
            // window.addEventListener('error', sourceError, true)

            // window.onerror = function onerror(e) {
            //   console.log('exec js error', e)
            // }

            // window.addEventListener('unhandledrejection', unCatchPromiseError, true)
          }
        }
      })(),
      ApmErrorPlugin(),
      ApmDevicePlugin()
    ]
  }
})
