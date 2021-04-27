/**
 * Contructor
 */
const configs = {}

const { location: { hostname } } = window;

/**
 * Development configurations
 */
configs.development = {
  cloud: {
    base: 'https://api-branch.ohmnilabs.com',
  },
  localBot: {
    base: 'http://192.168.123.13:3001',
    rosbridge: 'ws://192.168.123.13:9090',
  }
}

/**
 * Staging configurations
 */
configs.staging = {
  cloud: {
    base: 'https://api-branch.ohmnilabs.com',
  },
  localBot: {
    base: `http://${hostname}:3001`,
    rosbridge: `ws://${hostname}:9090`,
  }
}

/**
 * Production configurations
 */
configs.production = {
  cloud: {
    base: 'https://api-branch.ohmnilabs.com',
  },
  localBot: {
    base: `http://${hostname}:3001`,
    rosbridge: `ws://${hostname}:9090`,
  }
}

/**
 * Module exports
 */
export default configs;