export function sanitizeId(str) {
  return str.replace(/\//g, '__');
}

export function desanitizeId(str) {
  return str.replace(/__/g, '/');
}

export function formatarDataIsoParaBr(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
}
