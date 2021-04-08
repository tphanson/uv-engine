/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  cloud: {
    base: 'https://api-branch.ohmnilabs.com',
  },
  localBot: {
    base: 'http://192.168.123.64:3001',
    rosbridge: 'ws://192.168.123.64:9090',
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
    base: 'http://localhost:3001',
    rosbridge: 'ws://192.168.123.30:9090',
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
    base: 'http://localhost:3001',
    rosbridge: 'ws://192.168.123.30:9090',
  }
}

/**
 * Module exports
 */
export default configs;