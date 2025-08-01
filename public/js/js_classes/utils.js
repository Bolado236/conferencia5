export function sanitizeId(str = '') {
  return str.replaceAll('/', '__');
}

export function desanitizeId(str = '') {
  return str.replaceAll('__', '/');
}
