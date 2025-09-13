export function resolveImageUrl(path) {
  if (!path) return '/assets/placeholders/no-image.png'

  const base = process.env.VUE_APP_IMAGE_BASE_URL || ''
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
}
