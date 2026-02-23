/**
 * Application Configuration
 * Centralized configuration file for all environment-specific settings
 */

export const config = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 10000,
  },

  // Debug Mode
  debug: (process.env.NEXT_PUBLIC_DEBUG === 'true'),

  // App Information
  app: {
    name: 'WAR Washerman Panel',
    version: '1.0.0',
  },

  // Environment
  environment: process.env.NODE_ENV,

  // Feature Flags
  features: {
    enableLogging: (process.env.NEXT_PUBLIC_DEBUG === 'true'),
  },
} as const;

// Log config in development
if (config.debug) {
  console.log('🔧 App Configuration:', {
    apiBaseURL: config.api.baseURL,
    environment: config.environment,
    debug: config.debug,
  });
}

export default config;
