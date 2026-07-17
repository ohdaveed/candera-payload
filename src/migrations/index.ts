import * as migration_20260629_204245_initial from './20260629_204245_initial'
import * as migration_20260706_140359_login_theme from './20260706_140359_login_theme'
import * as migration_20260717_012226 from './20260717_012226'
import * as migration_20260717_021249 from './20260717_021249'
import * as migration_20260717_190146_remove_vessels_eyebrow_default from './20260717_190146_remove_vessels_eyebrow_default'

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
]
