import { sendToFormSubmit } from './formsubmit'

export interface FormRelayPayload {
  formTitle: string
  email: string | null
  submissionData: Array<{ field: string; value: string }>
}

/**
 * Seam decoupling form notifications from third-party HTTP transport details.
 */
export interface FormRelayPort {
  send(payload: FormRelayPayload): Promise<void>
}

/**
 * Production adapter relaying notifications to FormSubmit.co.
 */
export class FormSubmitAdapter implements FormRelayPort {
  async send(payload: FormRelayPayload): Promise<void> {
    await sendToFormSubmit(payload)
  }
}

/**
 * In-memory adapter for testing environments.
 */
export class InMemoryFormRelayAdapter implements FormRelayPort {
  public calls: FormRelayPayload[] = []

  async send(payload: FormRelayPayload): Promise<void> {
    this.calls.push(payload)
  }
}

export const defaultFormRelay = new FormSubmitAdapter()
