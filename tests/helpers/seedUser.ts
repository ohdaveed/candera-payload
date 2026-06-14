export const testUserCredentials = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

const SERVER_URL = 'http://localhost:3000'

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${SERVER_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev@candera.com', password: 'test1234' }),
  })
  if (!res.ok) throw new Error(`Admin login failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  return data.token
}

export async function seedTestUser(): Promise<void> {
  console.log('Seeding test user...')
  const token = await getAdminToken()

  // Delete existing test user if any
  const listRes = await fetch(
    `${SERVER_URL}/api/users?where[email][equals]=${encodeURIComponent(testUserCredentials.email)}&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const list = (await listRes.json()) as { docs: { id: string }[] }
  for (const doc of list.docs) {
    await fetch(`${SERVER_URL}/api/users/${doc.id}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    })
  }

  // Create fresh test user
  const createRes = await fetch(`${SERVER_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({
      name: 'Test Admin',
      email: testUserCredentials.email,
      password: testUserCredentials.password,
      roles: ['admin'],
      status: 'active',
    }),
  })
  if (!createRes.ok) {
    const body = await createRes.text()
    throw new Error(`Failed to create test user: ${createRes.status} ${body}`)
  }
  console.log('Created fresh test user:', testUserCredentials.email)
}

export async function cleanupTestUser(): Promise<void> {
  const token = await getAdminToken()
  const listRes = await fetch(
    `${SERVER_URL}/api/users?where[email][equals]=${encodeURIComponent(testUserCredentials.email)}&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const list = (await listRes.json()) as { docs: { id: string }[] }
  for (const doc of list.docs) {
    await fetch(`${SERVER_URL}/api/users/${doc.id}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    })
  }
}
