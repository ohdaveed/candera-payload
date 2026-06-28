type Listener = (el: HTMLElement | null) => void
const listeners = new Set<Listener>()
let currentEl: HTMLElement | null = null

export const setEndSentinel = (el: HTMLElement | null) => {
  currentEl = el
  listeners.forEach((l) => l(el))
}

export const subscribeToEndSentinel = (listener: Listener) => {
  listeners.add(listener)
  listener(currentEl)
  return () => {
    listeners.delete(listener)
  }
}
