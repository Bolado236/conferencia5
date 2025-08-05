import { db } from '../firebase.js';

export const divergenciaManager = {
  async getItensDivergentes(lojaId, contagemId) {
    const contagemRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId);

    const baseSnap = await contagemRef.collection('baseProdutos').get();
    const etapaSnap = await contagemRef.collection('etapas').get();

    const totais = {};

    for (const etapa of etapaSnap.docs) {
      const contagensSnap = await etapa.ref.collection('contagens').get();
      contagensSnap.forEach(doc => {
        const { produto, quantidade } = doc.data();
        if (!totais[produto]) totais[produto] = 0;
        totais[produto] += Number(quantidade);
      });
    }

    const divergentes = [];

    for (const doc of baseSnap.docs) {
      const prod = doc.data();
      const codigo = prod.codigo;
      const esperado = Number(prod.quantidade);
      const contado = Number(totais[codigo] || 0);

      if (contado !== esperado) {
        divergentes.push({
          codigoProduto: codigo,
          descricao: prod.descricao,
          subCategoria: prod.subCategoria,
          status: 'divergente',
          esperado,
          contado
        });

        await doc.ref.update({ status: 'divergente' });
      } else {
        await doc.ref.update({ status: 'correto' });
      }
    }

    return divergentes;
  }
};
