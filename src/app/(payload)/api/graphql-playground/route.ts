import config from '@payload-config'
import '@payloadcms/next/css'
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { userIsAdmin } from '@/access/isAdmin'

const playgroundHandler = GRAPHQL_PLAYGROUND_GET(config)

export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'development') {
    return playgroundHandler(request)
  }

  const payload = await getPayload({ config })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!userIsAdmin(user)) {
    return new Response('Not Found', { status: 404 })
  }

  return playgroundHandler(request)
}
