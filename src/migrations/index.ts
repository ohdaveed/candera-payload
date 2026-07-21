import * as migration_20260629_204245_initial from './20260629_204245_initial'
import * as migration_20260706_140359_login_theme from './20260706_140359_login_theme'
import * as migration_20260717_012226 from './20260717_012226'
import * as migration_20260717_021249 from './20260717_021249'
import * as migration_20260717_190146_remove_vessels_eyebrow_default from './20260717_190146_remove_vessels_eyebrow_default'
import * as migration_20260717_194701_remove_testimonials_badge_default from './20260717_194701_remove_testimonials_badge_default'
import * as migration_20260721_022706_add_events_collection from './20260721_022706_add_events_collection'
import * as migration_20260721_154103_add_etsy_sync_logs from './20260721_154103_add_etsy_sync_logs'
import * as migration_20260721_211422_add_events_mcp_permissions from './20260721_211422_add_events_mcp_permissions'

export const migrations = [
  {
    up: migration_20260629_204245_initial.up,
    down: migration_20260629_204245_initial.down,
    name: '20260629_204245_initial',
  },
  {
    up: migration_20260706_140359_login_theme.up,
    down: migration_20260706_140359_login_theme.down,
    name: '20260706_140359_login_theme',
  },
  {
    up: migration_20260717_012226.up,
    down: migration_20260717_012226.down,
    name: '20260717_012226',
  },
  {
    up: migration_20260717_021249.up,
    down: migration_20260717_021249.down,
    name: '20260717_021249',
  },
  {
    up: migration_20260717_190146_remove_vessels_eyebrow_default.up,
    down: migration_20260717_190146_remove_vessels_eyebrow_default.down,
    name: '20260717_190146_remove_vessels_eyebrow_default',
  },
  {
    up: migration_20260717_194701_remove_testimonials_badge_default.up,
    down: migration_20260717_194701_remove_testimonials_badge_default.down,
    name: '20260717_194701_remove_testimonials_badge_default',
  },
  {
    up: migration_20260721_022706_add_events_collection.up,
    down: migration_20260721_022706_add_events_collection.down,
    name: '20260721_022706_add_events_collection',
  },
  {
    up: migration_20260721_154103_add_etsy_sync_logs.up,
    down: migration_20260721_154103_add_etsy_sync_logs.down,
    name: '20260721_154103_add_etsy_sync_logs',
  },
  {
    up: migration_20260721_211422_add_events_mcp_permissions.up,
    down: migration_20260721_211422_add_events_mcp_permissions.down,
    name: '20260721_211422_add_events_mcp_permissions',
  },
]
