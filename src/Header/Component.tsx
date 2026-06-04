import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

/**
 * Server component that fetches header global data from the CMS and passes it to the client header.
 */
export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData} />
}
