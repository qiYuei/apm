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
    }
  ]
})
