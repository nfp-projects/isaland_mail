import _ from 'lodash'
import bunyan from 'bunyan'
import config from './config'

// Clone the settings as we will be touching
// on them slightly.
let settings = _.cloneDeep(config.get('bunyan'))

// Replace any instance of 'process.stdout' with the
// actual reference to the process.stdout.
for (let i = 0; i < settings.streams.length; i++) {
  if (settings.streams[i].stream === 'process.stdout') {
    settings.streams[i].stream = process.stdout
  }
}

// Create our logger.
const logger = bunyan.createLogger(settings)

export default logger
