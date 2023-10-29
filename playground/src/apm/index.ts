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
      return {
        name: '@apm/plugin-test22222',
        init(config) {
          console.log('init2222', config)
        }
      }
    }
  ]
})
