import Fuse from 'fuse.js';

export class DropSearch {
  constructor(inputElement, produtos, onSelect) {
    this.input = inputElement;
    this.produtos = produtos;
    this.onSelect = onSelect;

    this.fuse = new Fuse(produtos, {
      keys: ['descricao'],
      threshold: 0.3,
      includeScore: true
    });

    this.dropdown = document.createElement('ul');
    this.dropdown.className = 'dropdown-busca';
    this.input.parentNode.appendChild(this.dropdown);

    this.input.addEventListener('input', () => this.updateDropdown());
  }

  updateDropdown() {
    const termo = this.input.value.trim();
    this.dropdown.innerHTML = '';

    if (termo.length < 2) return;

    const resultados = this.fuse.search(termo).slice(0, 5);
    resultados.forEach(({ item }) => {
      const li = document.createElement('li');
      li.textContent = item.descricao;
      li.onclick = () => {
        this.input.value = item.descricao;
        this.dropdown.innerHTML = '';
        this.onSelect(item);
      };
      this.dropdown.appendChild(li);
    });
  }
}
