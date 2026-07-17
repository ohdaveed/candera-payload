import * as migration_20260629_204245_initial from './20260629_204245_initial';
import * as migration_20260706_140359_login_theme from './20260706_140359_login_theme';
import * as migration_20260717_012226 from './20260717_012226';

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
    name: '20260717_012226'
  },
];
