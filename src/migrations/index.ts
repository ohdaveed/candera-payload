import * as migration_20260409_155721_initial from './20260409_155721_initial';
import * as migration_20260531_232303_add_products_and_fix_media from './20260531_232303_add_products_and_fix_media';

export const migrations = [
  {
    up: migration_20260409_155721_initial.up,
    down: migration_20260409_155721_initial.down,
    name: '20260409_155721_initial',
  },
  {
    up: migration_20260531_232303_add_products_and_fix_media.up,
    down: migration_20260531_232303_add_products_and_fix_media.down,
    name: '20260531_232303_add_products_and_fix_media'
  },
];
