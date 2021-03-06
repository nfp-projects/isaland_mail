import _ from 'lodash'
import nconf from 'nconf'
const pckg = require('./package.json')


// Config follow the following priority check order:
// 1. Arguments
// 2. package.json
// 3. Enviroment variables
// 4. config/config.json
// 5. default settings


// Load arguments as highest priority
nconf.argv()


// Load package.json for name and such
let project = _.pick(pckg, ['name', 'version', 'description', 'author', 'license', 'homepage'])


// If we have global.it, there's a huge chance
// we're in test mode so we force node_env to be test.
if (typeof global.it === 'function') {
  project.NODE_ENV = 'test'
}


// Load overrides as second priority
nconf.overrides(project)


// Load enviroment variables as third priority
nconf.env()


// Load any overrides from the appropriate config file
if (nconf.get('NODE_ENV') === 'test') {
  // Load the config test file if we're in test mode
  nconf.file('config/config.test.json')
} else {
  // Otherwise load from config.json if it exists.
  nconf.file('config/config.json')
}

// Default variables for required database and other settings.
nconf.defaults({
  NODE_ENV: 'development',
  server: {
    port: 3000,
  },
  bunyan: {
    name: project.name,
    streams: [
      {
        stream: 'process.stdout',
        level: 'debug',
      },
    ],
  },
})

module.exports = nconf
