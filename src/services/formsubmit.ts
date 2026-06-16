type SubmissionField = { field: string; value: string }

type FormSubmitPayload = {
  formTitle: string
  email: string | null
  submissionData: SubmissionField[]
}

export async function sendToFormSubmit(payload: FormSubmitPayload): Promise<void> {
  const targetEmail = process.env.FORMSUBMIT_EMAIL || 'studio@canderacandles.com'

  // Flatten submission fields to key-value pairs
  const formFields = payload.submissionData.reduce(
    (acc, current) => {
      // Avoid sending empty/null values if possible, otherwise send string representation
      acc[current.field] = current.value !== null ? String(current.value) : ''
      return acc
    },
    {} as Record<string, string>,
  )

  // Construct FormSubmit payload
  const body = {
    ...formFields,
    _subject: `[Candera Studio] ${payload.formTitle} Submission`,
    _replyto: payload.email || undefined,
  }

  const endpoint = `https://formsubmit.co/ajax/${targetEmail}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`[formsubmit] submission failed with status ${response.status}: ${errorText}`)
  }

  const result = await response.json()
  if (result.success !== 'true') {
    throw new Error(`[formsubmit] submission returned unsuccessful: ${JSON.stringify(result)}`)
  }
}
