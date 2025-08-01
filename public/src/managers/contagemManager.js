import { contagemManager } from '../managers/contagemManager.js';
import { DropSearch } from '../components/DropSearch.js';
import { CameraScanner } from '../components/CameraScanner.js';
import { db } from '../firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const inputBusca = document.getElementById('inputBusca');
  const spanDescricao = document.getElementById('spanDescricao');
  const inputQtd = document.getElementById('inputQtd');
  const btnSalvar = document.getElementById('btnSalvar');
  const user = JSON.parse(sessionStorage.getItem('user'));

  let produtoSelecionado = null;
  const produtos = await contagemManager.carregarProdutosBase(user.loja, user.contagemAtual);

  new DropSearch(inputBusca, produtos, item => {
    produtoSelecionado = item;
    spanDescricao.textContent = item.descricao;
  });

  new CameraScanner('btnCamera', async code => {
    const produto = produtos.find(p => p.codigo === code || p.barras === code);
    if (produto) {
      produtoSelecionado = produto;
      inputBusca.value = produto.descricao;
      spanDescricao.textContent = produto.descricao;
    } else {
      alert('Produto não encontrado');
    }
  });

  btnSalvar.addEventListener('click', async () => {
    const qtd = Number(inputQtd.value);
    if (!produtoSelecionado || isNaN(qtd)) {
      alert('Selecione produto e informe a quantidade');
      return;
    }

    await contagemManager.salvarContagemProduto(produtoSelecionado, qtd, user);
    inputBusca.value = '';
    inputQtd.value = '';
    produtoSelecionado = null;
    spanDescricao.textContent = '';
  });
});

export const contagemManager = {
  async carregarProdutosBase(lojaId, contagemId) {
    const snapshot = await db
      .collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('baseProdutos')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async salvarContagemProduto(produto, qtd, user, contagemId, local) {
    const lojaRef = db.collection('conferencias').doc(user.loja);
    const etapaAtualSnap = await lojaRef.get();
    const etapaId = etapaAtualSnap.data().etapaAtual;

    const contagemRef = lojaRef
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('contagens')
      .doc(); // gera ID automático

    const payload = {
      usuario: user.usuario,
      local,
      quantidade: qtd,
      hora: new Date().toISOString(),
      produto: produto.codigo || produto.id,
      descricao: produto.descricao || '',
      subCategoria: produto.subCategoria || null
    };

    await contagemRef.set(payload);
  }
};