import * as migration_20260409_155721_initial from './20260409_155721_initial'
import * as migration_20260531_232303_add_products_and_fix_media from './20260531_232303_add_products_and_fix_media'
import * as migration_20260601_050751_add_etsy_image_id_to_media from './20260601_050751_add_etsy_image_id_to_media'
import * as migration_20260601_053209_align_schema_after_dev_mode from './20260601_053209_align_schema_after_dev_mode'
import * as migration_20260601_230148 from './20260601_230148'
import * as migration_20260602_125324 from './20260602_125324'
import * as migration_20260602_134834_add_storefront_hero_fields from './20260602_134834_add_storefront_hero_fields'
import * as migration_20260603_205647_add_status_to_products from './20260603_205647_add_status_to_products'
import * as migration_20260604_023044_add_product_type_and_seo from './20260604_023044_add_product_type_and_seo'
import * as migration_20260606_235002_add_footer_fields from './20260606_235002_add_footer_fields'
import * as migration_20260607_033421_add_briefs_collection from './20260607_033421_add_briefs_collection'
import * as migration_20260607_230627 from './20260607_230627'

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
    name: '20260601_053209_align_schema_after_dev_mode',
  },
  {
    up: migration_20260601_230148.up,
    down: migration_20260601_230148.down,
    name: '20260601_230148',
  },
  {
    up: migration_20260602_125324.up,
    down: migration_20260602_125324.down,
    name: '20260602_125324',
  },
  {
    up: migration_20260602_134834_add_storefront_hero_fields.up,
    down: migration_20260602_134834_add_storefront_hero_fields.down,
    name: '20260602_134834_add_storefront_hero_fields',
  },
  {
    up: migration_20260603_205647_add_status_to_products.up,
    down: migration_20260603_205647_add_status_to_products.down,
    name: '20260603_205647_add_status_to_products',
  },
  {
    up: migration_20260604_023044_add_product_type_and_seo.up,
    down: migration_20260604_023044_add_product_type_and_seo.down,
    name: '20260604_023044_add_product_type_and_seo',
  },
  {
    up: migration_20260606_235002_add_footer_fields.up,
    down: migration_20260606_235002_add_footer_fields.down,
    name: '20260606_235002_add_footer_fields',
  },
  {
    up: migration_20260607_033421_add_briefs_collection.up,
    down: migration_20260607_033421_add_briefs_collection.down,
    name: '20260607_033421_add_briefs_collection',
  },
  {
    up: migration_20260607_230627.up,
    down: migration_20260607_230627.down,
    name: '20260607_230627',
  },
]
