import { db } from '../firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const selectContagem = document.getElementById('selectContagem');
  const btnAcessar = document.getElementById('btnAcessar');
  const lojaSpan = document.getElementById('lojaAtual');

  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.loja) {
    alert('Usuário não autenticado');
    window.location.href = 'index.html';
    return;
  }

  lojaSpan.textContent = `Loja: ${user.loja}`;

  try {
    const snapshot = await db
      .collection('conferencias')
      .doc(user.loja)
      .collection('contagens')
      .get();

    const contagens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    contagens.forEach(contagem => {
      const opt = document.createElement('option');
      opt.value = contagem.id;
      opt.textContent = contagem.id;
      selectContagem.appendChild(opt);
    });

    btnAcessar.addEventListener('click', () => {
      const contagemSelecionada = selectContagem.value;
      if (!contagemSelecionada) {
        alert('Selecione uma contagem');
        return;
      }
      sessionStorage.setItem('contagemAtual', contagemSelecionada);
      window.location.href = 'contagem.html';
    });

  } catch (err) {
    console.error('Erro ao carregar contagens:', err);
    alert('Erro ao carregar contagens');
  }
});
