import * as migration_20260409_155721_initial from './20260409_155721_initial';
import * as migration_20260531_232303_add_products_and_fix_media from './20260531_232303_add_products_and_fix_media';
import * as migration_20260601_050751_add_etsy_image_id_to_media from './20260601_050751_add_etsy_image_id_to_media';
import * as migration_20260601_053209_align_schema_after_dev_mode from './20260601_053209_align_schema_after_dev_mode';

export const migrations = [
  {
    up: migration_20260409_155721_initial.up,
    down: migration_20260409_155721_initial.down,
    name: '20260409_155721_initial',
  },
  {
    up: migration_20260531_232303_add_products_and_fix_media.up,
    down: migration_20260531_232303_add_products_and_fix_media.down,
    name: '20260531_232303_add_products_and_fix_media',
  },
  {
    up: migration_20260601_050751_add_etsy_image_id_to_media.up,
    down: migration_20260601_050751_add_etsy_image_id_to_media.down,
    name: '20260601_050751_add_etsy_image_id_to_media',
  },
  {
    up: migration_20260601_053209_align_schema_after_dev_mode.up,
    down: migration_20260601_053209_align_schema_after_dev_mode.down,
    name: '20260601_053209_align_schema_after_dev_mode'
  },
];
