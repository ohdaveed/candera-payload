import * as migration_20260629_204245_initial from './20260629_204245_initial'
import * as migration_20260706_140359_login_theme from './20260706_140359_login_theme'

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
]
