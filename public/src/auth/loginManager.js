import { usuarioManager } from '../managers/usuarioManager.js';

export const loginManager = {
  async realizarLogin(usuario, senha, loja) {
    if (!usuario || !senha || !loja) {
      throw new Error('Todos os campos são obrigatórios');
    }

    const userData = await usuarioManager.login(usuario, senha, loja);

    // Salvar sessão local
    sessionStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },

  logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
  },

  getUsuarioLogado() {
    const dados = sessionStorage.getItem('user');
    return dados ? JSON.parse(dados) : null;
  }
};
