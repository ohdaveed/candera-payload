async function main() {
  const apiKey = process.env.PAYLOAD_MCP_API_KEY
  if (!apiKey) {
    console.error('❌ Error: PAYLOAD_MCP_API_KEY is not defined in the environment!')
    process.exit(1)
  }

  console.log(`Sending request with key (length: ${apiKey.length})...`)

  try {
    const res = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 1,
      }),
    })

    const text = await res.text()
    console.log(`Response Status: ${res.status}`)
    console.log('Response Body:', text)
  } catch (err) {
    console.error('❌ Request failed:', err)
  }
}

void main().catch((err) => {
  console.error('❌ Unhandled error:', err)
  process.exit(1)
})
