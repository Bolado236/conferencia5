import { db } from '../firebase.js';

export const relatorioManager = {
  async obterItensContados(lojaId, contagemId) {
    const etapaSnap = await db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .get();

    const contados = {};

    for (const etapa of etapaSnap.docs) {
      const contagensSnap = await etapa.ref.collection('contagens').get();
      contagensSnap.forEach(doc => {
        const data = doc.data();
        const codigo = data.produto;
        if (!contados[codigo]) contados[codigo] = 0;
        contados[codigo] += Number(data.quantidade);
      });
    }

    return Object.entries(contados).map(([codigo, quantidade]) => ({
      codigo,
      quantidade
    }));
  },

  async obterItensNaoContados(lojaId, contagemId) {
    const baseSnap = await db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('baseProdutos')
      .get();

    const todosCodigos = baseSnap.docs.map(doc => doc.data().codigo);

    const contados = await this.obterItensContados(lojaId, contagemId);
    const codigosContados = contados.map(p => p.codigo);

    const naoContados = todosCodigos.filter(cod => !codigosContados.includes(cod));

    return naoContados;
  },

  async obterDivergentes(lojaId, contagemId) {
    const baseSnap = await db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('baseProdutos')
      .get();

    const contados = await this.obterItensContados(lojaId, contagemId);
    const mapContado = Object.fromEntries(contados.map(p => [p.codigo, p.quantidade]));

    const divergentes = [];

    baseSnap.forEach(doc => {
      const base = doc.data();
      const esperado = Number(base.quantidade);
      const contado = Number(mapContado[base.codigo] || 0);
      if (contado !== esperado) {
        divergentes.push({
          codigoProduto: base.codigo,
          descricao: base.descricao,
          esperado,
          contado,
          status: 'divergente'
        });
      }
    });

    return divergentes;
  }
};
