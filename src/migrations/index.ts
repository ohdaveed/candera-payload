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
import * as migration_20260609_030106_add_quiz_collections from './20260609_030106_add_quiz_collections'
import * as migration_20260610_040157 from './20260610_040157'
import * as migration_20260610_060333_user_table_metadata from './20260610_060333_user_table_metadata'
import * as migration_20260612_073101_add_products_to_search from './20260612_073101_add_products_to_search'
import * as migration_20260612_081028_add_site_theme from './20260612_081028_add_site_theme'
import * as migration_20260612_082000_extend_site_theme from './20260612_082000_extend_site_theme'
import * as migration_20260614_132108 from './20260614_132108'
import * as migration_20260614_184500_add_storefront_hero_price_and_link from './20260614_184500_add_storefront_hero_price_and_link'
import * as migration_20260614_212000_add_products_to_archive_relation_to_enum from './20260614_212000_add_products_to_archive_relation_to_enum'
import * as migration_20260615_add_documentation_collection from './20260615_add_documentation_collection'
import * as migration_20260622_205309 from './20260622_205309'
import * as migration_20260623_001156_add_studio_info from './20260623_001156_add_studio_info'
import * as migration_20260623_102932_add_the_vessels_block from './20260623_102932_add_the_vessels_block'
import * as migration_20260628_023604_drop_hero_ships_default from './20260628_023604_drop_hero_ships_default'
import * as migration_20260628_030735_update_site_theme_font_set_enum from './20260628_030735_update_site_theme_font_set_enum'

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
  {
    up: migration_20260609_030106_add_quiz_collections.up,
    down: migration_20260609_030106_add_quiz_collections.down,
    name: '20260609_030106_add_quiz_collections',
  },
  {
    up: migration_20260610_040157.up,
    down: migration_20260610_040157.down,
    name: '20260610_040157',
  },
  {
    up: migration_20260610_060333_user_table_metadata.up,
    down: migration_20260610_060333_user_table_metadata.down,
    name: '20260610_060333_user_table_metadata',
  },
  {
    up: migration_20260612_073101_add_products_to_search.up,
    down: migration_20260612_073101_add_products_to_search.down,
    name: '20260612_073101_add_products_to_search',
  },
  {
    up: migration_20260612_081028_add_site_theme.up,
    down: migration_20260612_081028_add_site_theme.down,
    name: '20260612_081028_add_site_theme',
  },
  {
    up: migration_20260612_082000_extend_site_theme.up,
    down: migration_20260612_082000_extend_site_theme.down,
    name: '20260612_082000_extend_site_theme',
  },
  {
    up: migration_20260614_132108.up,
    down: migration_20260614_132108.down,
    name: '20260614_132108',
  },
  {
    up: migration_20260614_184500_add_storefront_hero_price_and_link.up,
    down: migration_20260614_184500_add_storefront_hero_price_and_link.down,
    name: '20260614_184500_add_storefront_hero_price_and_link',
  },
  {
    up: migration_20260614_212000_add_products_to_archive_relation_to_enum.up,
    down: migration_20260614_212000_add_products_to_archive_relation_to_enum.down,
    name: '20260614_212000_add_products_to_archive_relation_to_enum',
  },
  {
    up: migration_20260615_add_documentation_collection.up,
    down: migration_20260615_add_documentation_collection.down,
    name: '20260615_add_documentation_collection',
  },
  {
    up: migration_20260622_205309.up,
    down: migration_20260622_205309.down,
    name: '20260622_205309',
  },
  {
    up: migration_20260623_001156_add_studio_info.up,
    down: migration_20260623_001156_add_studio_info.down,
    name: '20260623_001156_add_studio_info',
  },
  {
    up: migration_20260623_102932_add_the_vessels_block.up,
    down: migration_20260623_102932_add_the_vessels_block.down,
    name: '20260623_102932_add_the_vessels_block',
  },
  {
    up: migration_20260628_023604_drop_hero_ships_default.up,
    down: migration_20260628_023604_drop_hero_ships_default.down,
    name: '20260628_023604_drop_hero_ships_default',
  },
  {
    up: migration_20260628_030735_update_site_theme_font_set_enum.up,
    down: migration_20260628_030735_update_site_theme_font_set_enum.down,
    name: '20260628_030735_update_site_theme_font_set_enum',
  },
]
