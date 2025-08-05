export const dateUtils = {
  agoraIso() {
    return new Date().toISOString();
  },

  formatarBr(date) {
    return new Date(date).toLocaleString('pt-BR');
  },

  apenasData(iso) {
    return new Date(iso).toLocaleDateString('pt-BR');
  },

  apenasHora(iso) {
    return new Date(iso).toLocaleTimeString('pt-BR');
  }
};
