import { type ApmClient } from '@apm/core'
import { ApmErrorPlugin, createBrowserClient, ApmDevicePlugin, fp, fcp, lcp } from '@apm/browser'

const client = createBrowserClient({
  monitor: {
    error: true
  },
  senderConfigure: {
    mode: 'fetch',
    url: 'xxxxx'
  },
  apmConfig: {
    interval: 5000,
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
      ApmDevicePlugin(),
      fp(),
      fcp(),
      lcp()
    ]
  }
})
