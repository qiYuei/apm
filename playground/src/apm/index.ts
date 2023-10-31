import { createClient, type ApmClient } from '@apm/core'
import { getPageUrl } from '@apm/shared'

const client = createClient({
  senderConfigure: {
    mode: 'fetch',
    url: 'xxxxx'
  },
  plugins: [
    () => {
      return {
        name: '@apm/plugin-test',
        init(config) {
          console.log('init', config)
          throw new Error('copwe')
        }
      }
    },
    () => {
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
        init(config, clientInstance) {
          console.log('ioooooooooooooooooooooooooooooooo')
          client = clientInstance
          // 捕获资源加载失败错误 js css img...
          window.addEventListener('error', sourceError, true)

          window.onerror = function onerror(e) {
            console.log('exec js error', e)
          }

          window.addEventListener('unhandledrejection', unCatchPromiseError, true)
        }
      }
    }
  ]
})
