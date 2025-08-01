export function showToast(msg, tipo = 'info') {
  const div = document.createElement('div');
  div.className = `toast toast-${tipo}`;
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
