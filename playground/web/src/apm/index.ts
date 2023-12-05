import { type ApmClient } from '@apm/core'
import {
  ApmErrorPlugin,
  createBrowserClient,
  fp,
  fcp,
  lcp,
  timeLine,
  requestPlugin
} from '@apm/browser'

const client = createBrowserClient({
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
    ApmErrorPlugin(),
    fp(),
    fcp(),
    lcp(),
    timeLine(),
    requestPlugin({
      async beforeTracker(response, send) {
        const clone = response.clone()
        const ret = (await clone.json()) as {
          code: number
          data: unknown
          message: string
          details?: string
        }
        console.log('就走了一次？？？？？？？？？？')
        console.log(ret, 'ret')
        return {
          state: ret.code === 1 ? 'success' : 'failed',
          error: ret.details
        }
      }
    })
  ],
  monitor: {
    error: true
  },
  senderConfigure: {
    mode: 'fetch',
    url: 'http://localhost:3000/api/report',
    beforeSender(data, config) {
      console.log('没走这个？')
      return {
        hint: {
          time: Date.now(),
          reports: data
        }
      }
    }
  },
  apmConfig: {
    interval: 5000
  }
})
