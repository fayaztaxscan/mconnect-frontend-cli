// src/utils/apiUnwrap.js
export function unwrapList(payload) {
  const list = payload?.data ?? payload
  return Array.isArray(list) ? list : []
}

export function unwrapObject(payload) {
  // For single item endpoints: payload can be {data:{...}} or {...}
  return payload?.data ?? payload
}
