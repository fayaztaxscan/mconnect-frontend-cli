// src/utils/imageUrl.js

// Resolve a public asset base without using import.meta (works in webpack & Vite)
const ENV_BASE =
  (typeof process !== 'undefined' && process.env
    ? (process.env.VITE_PUBLIC_ASSET_BASE ||
       process.env.VUE_APP_PUBLIC_ASSET_BASE ||  // Vue CLI style
       process.env.BASE_URL || '')
    : '') || '';

const WIN_BASE =
  (typeof window !== 'undefined' && window.__PUBLIC_ASSET_BASE__)
    ? window.__PUBLIC_ASSET_BASE__
    : '';

const BASE = String(WIN_BASE || ENV_BASE).replace(/\/+$/, ''); // no trailing slash

function withBase(p) {
  if (!BASE) return p;                             // same origin
  if (/^(https?:)?\/\//i.test(p)) return p;        // absolute already
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`;
}

/**
 * Idempotent mapping for values stored in DB:
 * - absolute URLs (http/https///)    -> returned as-is
 * - data:/blob:                      -> returned as-is
 * - '/uploads/...'                   -> joined with BASE (if any)
 * - 'uploads/...'                    -> normalized to '/uploads/...'
 * - 'products/...'                   -> normalized to '/uploads/products/...'
 * - anything else                    -> treated as relative under '/uploads'
 */
export function resolveImageUrl(v) {
  if (!v) return '';
  const s = String(v).trim();

  // absolute or special schemes
  if (/^(https?:)?\/\//i.test(s)) return s;
  if (/^(data:|blob:)/i.test(s)) return s;

  // normalized uploads paths
  if (s.startsWith('/uploads/')) return withBase(s);
  if (s.startsWith('uploads/'))   return withBase('/' + s);

  // subdir stored without '/uploads'
  if (s.startsWith('products/'))  return withBase('/uploads/' + s);

  // fallback: assume it lives under /uploads
  return withBase(s.startsWith('/') ? s : '/uploads/' + s);
}

export default resolveImageUrl;
