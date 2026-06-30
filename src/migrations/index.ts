import * as migration_20260629_204245_initial from './20260629_204245_initial'

export const migrations = [
  {
    up: migration_20260629_204245_initial.up,
    down: migration_20260629_204245_initial.down,
    name: '20260629_204245_initial',
  },
]
