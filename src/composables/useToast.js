import { reactive } from 'vue'

let _id = 0
const toasts = reactive([])

function remove(id) {
  const i = toasts.findIndex(t => t.id === id)
  if (i > -1) toasts.splice(i, 1)
}

function push({ type = 'info', message = '', title = '', timeout = 3500, actionLabel, onAction } = {}) {
  const id = ++_id
  toasts.push({ id, type, message, title, actionLabel, onAction })
  if (timeout > 0) setTimeout(() => remove(id), timeout)
  return id
}

export function useToast() {
  return {
    toasts,
    remove,
    push,
    success: (message, opts = {}) => push({ type: 'success', message, ...opts }),
    error:   (message, opts = {}) => push({ type: 'error',   message, ...opts }),
    info:    (message, opts = {}) => push({ type: 'info',    message, ...opts }),
  }
}
