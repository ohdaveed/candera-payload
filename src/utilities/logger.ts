import { createConsola } from 'consola'

/**
 * Centralized logger for the Candera project.
 * Uses 'consola' for elegant console output with levels and tags.
 */
export const logger = createConsola({
  level: process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : 3, // Default to info (3)
  formatOptions: {
    date: true,
    colors: true,
  },
})

// Export specialized loggers with tags
export const etsyLogger = logger.withTag('Etsy')
export const payloadLogger = logger.withTag('Payload')
export const syncLogger = logger.withTag('Sync')
export const seedLogger = logger.withTag('Seed')

export default logger
