import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Lazily initialised — only created when first needed at runtime
let _client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!url || !serviceKey) {
    throw new Error('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
  }
  if (!_client) {
    _client = createClient(url, serviceKey, {
      auth: { persistSession: false },
    })
  }
  return _client
}

type FormSubmissionRow = {
  form_title: string
  email: string | null
  submission_data: { field: string; value: string }[]
  tags: string[]
  scent_result: string | null
  payload_submission_id: string | null
}

export async function archiveFormSubmission(row: FormSubmissionRow): Promise<void> {
  const client = getClient()
  const { error } = await client.from('form_submissions').insert(row as never)
  if (error) {
    throw new Error(`[supabase] insert failed: ${error.message}`)
  }
}
