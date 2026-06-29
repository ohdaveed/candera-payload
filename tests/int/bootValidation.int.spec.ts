import { beforeEach, afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { validateBootConfig } from '@/utilities/bootValidation'
import { payloadLogger } from '@/utilities/logger'

describe('validateBootConfig', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
    // Ensure core variables are set by default to isolate other tests
    process.env.PAYLOAD_SECRET = 'test-secret'
    process.env.DATABASE_URI = 'postgres://localhost:5432/test'
    process.env.VERCEL_ENV = 'development'
    delete process.env.BLOB_READ_WRITE_TOKEN

    vi.spyOn(payloadLogger, 'success').mockImplementation(() => payloadLogger)
    vi.spyOn(payloadLogger, 'warn').mockImplementation(() => payloadLogger)
    vi.spyOn(payloadLogger, 'info').mockImplementation(() => payloadLogger)
    vi.spyOn(payloadLogger, 'error').mockImplementation(() => payloadLogger)
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('Fatal validation (Secrets)', () => {
    it('throws if PAYLOAD_SECRET is missing', () => {
      delete (process.env as Record<string, string | undefined>).PAYLOAD_SECRET
      expect(() => validateBootConfig()).toThrow(/PAYLOAD_SECRET is not set/)
    })

    it('throws if DATABASE_URI and POSTGRES_URL are missing', () => {
      delete (process.env as Record<string, string | undefined>).DATABASE_URI
      delete (process.env as Record<string, string | undefined>).POSTGRES_URL
      expect(() => validateBootConfig()).toThrow(/DATABASE_URI \(or POSTGRES_URL\) is not set/)
    })

    it('throws if BLOB_READ_WRITE_TOKEN is invalid/missing in production VERCEL_ENV', () => {
      process.env.VERCEL_ENV = 'production'
      expect(() => validateBootConfig()).toThrow(/BLOB_READ_WRITE_TOKEN must be set/)

      process.env.BLOB_READ_WRITE_TOKEN = 'invalid_token'
      expect(() => validateBootConfig()).toThrow(/BLOB_READ_WRITE_TOKEN must be set/)
    })

    it('succeeds if BLOB_READ_WRITE_TOKEN is valid in production VERCEL_ENV', () => {
      process.env.VERCEL_ENV = 'production'
      process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test'
      expect(() => validateBootConfig()).not.toThrow()
    })
  })

  describe('Non-fatal validation (Warnings)', () => {
    it('logs info/warning if Etsy shop id is missing or invalid', () => {
      // Set valid Etsy credentials first
      process.env.ETSY_API_KEY = 'apikey'
      process.env.ETSY_SHARED_SECRET = 'secret'

      // Missing shop ID
      delete (process.env as Record<string, string | undefined>).ETSY_SHOP_ID
      validateBootConfig()
      expect(payloadLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('ETSY_SHOP_ID is not set'),
      )

      // Invalid shop ID
      process.env.ETSY_SHOP_ID = 'not-an-integer'
      validateBootConfig()
      expect(payloadLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('is invalid (must be a positive integer)'),
      )

      // Pass reference (should be valid and not log warning or info)
      process.env.ETSY_SHOP_ID = 'pass://some_vault/some_item/ETSY_SHOP_ID'
      vi.clearAllMocks()
      validateBootConfig()
      expect(payloadLogger.info).not.toHaveBeenCalled()
      expect(payloadLogger.warn).not.toHaveBeenCalled()
    })

    it('logs warning if Etsy credentials (API Key or Shared Secret) are missing', () => {
      process.env.ETSY_SHOP_ID = '12345'
      delete process.env.ETSY_API_KEY
      delete process.env.ETSY_SHARED_SECRET

      validateBootConfig()
      expect(payloadLogger.warn).toHaveBeenCalledWith(expect.stringContaining('ETSY_API_KEY'))
      expect(payloadLogger.warn).toHaveBeenCalledWith(expect.stringContaining('ETSY_SHARED_SECRET'))
    })

    it('logs warning if both RESEND_API_KEY and SMTP_HOST are missing', () => {
      delete process.env.RESEND_API_KEY
      delete process.env.SMTP_HOST

      validateBootConfig()
      expect(payloadLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('neither RESEND_API_KEY nor SMTP_HOST is set'),
      )
    })

    it('logs warning if SMTP_HOST is configured but credentials are missing', () => {
      delete process.env.RESEND_API_KEY
      process.env.SMTP_HOST = 'smtp.example.com'
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASS

      validateBootConfig()
      expect(payloadLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('SMTP_HOST is configured, but SMTP_USER or SMTP_PASS is not set'),
      )
    })
  })
})
