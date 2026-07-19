// Thin re-export barrel. The Etsy sync engine was decomposed into focused
// modules under `./sync/` (types + ports, pure description parsing, engine,
// production adapters); every existing importer of '@/utilities/syncEtsy'
// keeps working unchanged.
export * from './sync/types'
export * from './sync/descriptionParser'
export * from './sync/engine'
export * from './sync/adapters'
