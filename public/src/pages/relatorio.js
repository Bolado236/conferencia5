import { db } from '../firebase.js';
import { relatorioManager } from '../managers/relatorioManager.js';
import { authService } from '../services/authService.js';
import { domUtils } from '../utils/domUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = authService.getUsuario();
  if (!user || user.tipo !== 'admin') {
    alert('Acesso negado');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('relatorioLoja').textContent = `Loja: ${user.loja}`;
  const selectContagem = document.getElementById('selectContagem');
  const tabela = document.getElementById('tabelaResultados');

  // Preencher contagens
  const snapshot = await db.collection('conferencias')
    .doc(user.loja)
    .collection('contagens')
    .get();

  snapshot.forEach(doc => {
    selectContagem.appendChild(domUtils.criarOption(doc.id, doc.id));
  });

  // Eventos de botões
  document.getElementById('btnContados').addEventListener('click', async () => {
    const contagemId = selectContagem.value;
    const dados = await relatorioManager.obterItensContados(user.loja, contagemId);
    renderTabela(['Código', 'Quantidade'], dados.map(d => [d.codigo, d.quantidade]));
  });

  document.getElementById('btnNaoContados').addEventListener('click', async () => {
    const contagemId = selectContagem.value;
    const dados = await relatorioManager.obterItensNaoContados(user.loja, contagemId);
    renderTabela(['Código Não Contado'], dados.map(c => [c]));
  });

  document.getElementById('btnDivergentes').addEventListener('click', async () => {
    const contagemId = selectContagem.value;
    const dados = await relatorioManager.obterDivergentes(user.loja, contagemId);
    renderTabela(['Código', 'Descrição', 'Esperado', 'Contado'], dados.map(d => [
      d.codigoProduto,
      d.descricao,
      d.esperado,
      d.contado
    ]));
  });

  function renderTabela(cabecalhos, linhas) {
    const thead = tabela.querySelector('thead');
    const tbody = tabela.querySelector('tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const trHead = document.createElement('tr');
    cabecalhos.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    linhas.forEach(linha => {
      const tr = document.createElement('tr');
      linha.forEach(celula => {
        const td = document.createElement('td');
        td.textContent = celula;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
});
