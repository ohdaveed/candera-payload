import { beforeEach, afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { payloadLogger } from '@/utilities/logger'
import {
  isUnresolvedPassReference,
  isValidVercelBlobToken,
  resolveDatabaseConnectionString,
} from '@/utilities/resolveEnvValue'

describe('resolveEnvValue', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.spyOn(payloadLogger, 'warn').mockImplementation(() => payloadLogger)
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  describe('isUnresolvedPassReference', () => {
    it('detects pass:// URIs', () => {
      expect(isUnresolvedPassReference('pass://vault/item/field')).toBe(true)
    })

    it('ignores resolved values', () => {
      expect(isUnresolvedPassReference('postgres://localhost:5432/test')).toBe(false)
      expect(isUnresolvedPassReference(undefined)).toBe(false)
    })
  })

  describe('resolveDatabaseConnectionString', () => {
    it('prefers DATABASE_URI when it is resolved', () => {
      process.env.DATABASE_URI = 'postgres://primary/db'
      process.env.POSTGRES_URL = 'postgres://fallback/db'

      expect(resolveDatabaseConnectionString()).toBe('postgres://primary/db')
    })

    it('falls back to POSTGRES_URL when DATABASE_URI is a pass:// reference', () => {
      process.env.DATABASE_URI = 'pass://vault/item/DATABASE_URI'
      process.env.POSTGRES_URL = 'postgres://neon.example/db'
      delete process.env.DATABASE_URL

      expect(resolveDatabaseConnectionString()).toBe('postgres://neon.example/db')
      expect(payloadLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Ignoring unresolved pass:// reference(s) in DATABASE_URI'),
      )
    })

    it('returns undefined when only pass:// references are configured', () => {
      process.env.DATABASE_URI = 'pass://vault/item/DATABASE_URI'
      process.env.POSTGRES_URL = 'pass://vault/item/POSTGRES_URL'
      delete process.env.DATABASE_URL
      delete process.env.PGHOST
      delete process.env.PGUSER
      delete process.env.PGPASSWORD
      delete process.env.PGDATABASE

      expect(resolveDatabaseConnectionString()).toBeUndefined()
    })

    it('falls back to PG* parts when URL env vars are pass:// references', () => {
      process.env.DATABASE_URI = 'pass://vault/item/DATABASE_URI'
      process.env.DATABASE_URL = 'pass://vault/item/DATABASE_URL'
      process.env.POSTGRES_URL = 'pass://vault/item/POSTGRES_URL'
      delete process.env.DATABASE_URL_UNPOOLED
      process.env.PGHOST = 'ep-example.neon.tech'
      process.env.PGUSER = 'neondb_owner'
      process.env.PGPASSWORD = 'secret'
      process.env.PGDATABASE = 'neondb'

      expect(resolveDatabaseConnectionString()).toBe(
        'postgresql://neondb_owner:secret@ep-example.neon.tech:5432/neondb',
      )
    })
  })

  describe('isValidVercelBlobToken', () => {
    it('accepts well-formed Vercel Blob tokens', () => {
      expect(isValidVercelBlobToken('vercel_blob_rw_storeid_randomsecret')).toBe(true)
    })

    it('rejects pass:// references and malformed tokens', () => {
      expect(isValidVercelBlobToken('pass://vault/item/BLOB_READ_WRITE_TOKEN')).toBe(false)
      expect(isValidVercelBlobToken('vercel_blob_rw_onlyonepart')).toBe(false)
    })
  })
})
