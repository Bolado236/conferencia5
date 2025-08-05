import { loginManager } from '../auth/loginManager.js';
import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnLogin').addEventListener('click', async () => {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const loja = document.getElementById('loja').value.trim();

    try {
      const user = await loginManager.realizarLogin(usuario, senha, loja);
      const destino = user.tipo === 'admin' ? 'admin.html' : 'hub.html';
      window.location.href = destino;
    } catch (err) {
      showToast(err.message || 'Erro no login', 'erro');
    }
  });
});
