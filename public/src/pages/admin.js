import { adminManager } from '../managers/adminManager.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const lojaSpan = document.getElementById('adminLoja');
  const user = JSON.parse(sessionStorage.getItem('user'));

  if (!user || !user.loja || user.tipo !== 'admin') {
    alert('Acesso negado');
    window.location.href = 'index.html';
    return;
  }

  lojaSpan.textContent = `Loja: ${user.loja}`;

  const fileInput = document.getElementById('fileBase');
  const btnUploadBase = document.getElementById('btnUploadBase');
  const btnCriarContagem = document.getElementById('btnCriarContagem');
  const btnGerarEtapa = document.getElementById('btnGerarEtapa');
  const selectContagens = document.getElementById('selectContagens');
  const btnCadastrar = document.getElementById('btnCadastrar');

  // 🧩 Preencher contagens
  await adminManager.carregarContagens(user.loja, selectContagens);

  // 📤 Upload da base
  btnUploadBase.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return showToast('Selecione um arquivo .xlsx', 'erro');
    try {
      await adminManager.enviarBaseProdutos(user.loja, file);
      showToast('Base de produtos importada com sucesso ✅', 'sucesso');
    } catch (err) {
      console.error(err);
      showToast('Erro ao enviar base', 'erro');
    }
  });

  // 📝 Criar nova contagem
  btnCriarContagem.addEventListener('click', async () => {
    const nome = document.getElementById('nomeContagem').value.trim();
    const modelo = document.getElementById('modeloContagem').value;
    if (!nome || !modelo) return showToast('Preencha todos os campos', 'erro');

    try {
      await adminManager.criarContagem(user.loja, nome, modelo);
      showToast('Contagem criada ✅', 'sucesso');
      await adminManager.carregarContagens(user.loja, selectContagens);
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar contagem', 'erro');
    }
  });

  // 🔁 Gerar etapa
  btnGerarEtapa.addEventListener('click', async () => {
    const contagemId = selectContagens.value;
    if (!contagemId) return showToast('Selecione uma contagem', 'erro');

    try {
      await adminManager.gerarEtapaSubcategoria(user.loja, contagemId);
      showToast('Etapa gerada com sucesso 🎯', 'sucesso');
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar etapa', 'erro');
    }
  });

  // 👤 Cadastrar usuário
  btnCadastrar.addEventListener('click', async () => {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const tipo = document.getElementById('tipoUsuario').value;
    const lojaCadastro = document.getElementById('lojaUsuario').value.trim();

    if (!usuario || !senha || !lojaCadastro) return showToast('Preencha todos os campos', 'erro');

    try {
      await adminManager.cadastrarUsuario({
        usuario,
        senha,
        tipo,
        loja: lojaCadastro
      });
      showToast('Usuário cadastrado ✅', 'sucesso');
    } catch (err) {
      console.error(err);
      showToast('Erro ao cadastrar usuário', 'erro');
    }
  });
});
