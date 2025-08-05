export const authService = {
  getUsuario() {
    const session = sessionStorage.getItem('user');
    return session ? JSON.parse(session) : null;
  },

  verificarAcesso(tipoRequerido) {
    const user = this.getUsuario();
    if (!user) {
      alert('Sessão expirada ou não logado');
      window.location.href = 'index.html';
      return;
    }

    if (tipoRequerido && user.tipo !== tipoRequerido) {
      alert('Acesso não autorizado');
      window.location.href = 'index.html';
    }
  },

  logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
  }
};
