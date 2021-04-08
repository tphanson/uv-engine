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
    base: 'https://localhost:3001'
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
    base: 'https://localhost:3001'
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
    base: 'https://localhost:3001'
  }
}

/**
 * Module exports
 */
export default configs;