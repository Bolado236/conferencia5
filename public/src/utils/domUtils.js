export const domUtils = {
  limparSelect(select) {
    select.innerHTML = '';
  },

  criarOption(texto, valor) {
    const opt = document.createElement('option');
    opt.textContent = texto;
    opt.value = valor;
    return opt;
  },

  toggleElemento(id, mostrar) {
    const el = document.getElementById(id);
    if (el) el.style.display = mostrar ? 'block' : 'none';
  },

  setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
  }
};
