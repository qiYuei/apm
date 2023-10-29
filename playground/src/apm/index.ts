import { createClient } from '@apm/core'

const client = createClient({
  plugins: [
    () => {
      return {
        name: '@apm/plugin-test',
        init(config) {
          console.log('init', config)
        }
      }
    },
    () => {
      function sourceError(e: ErrorEvent) {
        console.log('load source error', e)
      }

      function unCatchPromiseError(e: PromiseRejectionEvent) {
        console.log('unCatch Promise error', e)
      }

      return {
        name: '@apm/plugin-test22222',
        init(config) {
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
