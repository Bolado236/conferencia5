import { contagemManager } from '../managers/contagemManager.js';
import { DropSearch } from '../components/DropSearch.js';
import { CameraScanner } from '../components/CameraScanner.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const contagemAtual = sessionStorage.getItem('contagemAtual');

  if (!user || !contagemAtual) {
    alert('Usuário não autenticado');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('usuarioAtual').textContent = `Usuário: ${user.usuario}`;

  const inputBusca = document.getElementById('inputBusca');
  const spanDescricao = document.getElementById('spanDescricao');
  const inputQtd = document.getElementById('inputQtd');
  const btnSalvar = document.getElementById('btnSalvar');
  const selectLocal = document.getElementById('selectLocal');

  let produtoSelecionado = null;

  try {
    const produtos = await contagemManager.carregarProdutosBase(user.loja, contagemAtual);

    new DropSearch(inputBusca, produtos, item => {
      produtoSelecionado = item;
      spanDescricao.textContent = `Descrição: ${item.descricao}`;
    });

    new CameraScanner('btnCamera', code => {
      const produto = produtos.find(p => p.codigo === code || p.barras === code);
      if (produto) {
        produtoSelecionado = produto;
        inputBusca.value = produto.descricao;
        spanDescricao.textContent = `Descrição: ${produto.descricao}`;
      } else {
        showToast('Produto não encontrado', 'erro');
      }
    });

    btnSalvar.addEventListener('click', async () => {
      const qtd = Number(inputQtd.value);
      const local = selectLocal.value;

      if (!produtoSelecionado || isNaN(qtd) || qtd < 0) {
        return showToast('Preencha corretamente todos os campos', 'erro');
      }

      await contagemManager.salvarContagemProduto(produtoSelecionado, qtd, user, contagemAtual, local);
      showToast('Contagem registrada com sucesso ✅', 'sucesso');

      // Limpar campos
      inputBusca.value = '';
      inputQtd.value = '';
      spanDescricao.textContent = 'Descrição:';
      produtoSelecionado = null;
    });

  } catch (err) {
    console.error(err);
    showToast('Erro ao carregar produtos', 'erro');
  }
});
