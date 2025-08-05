import { db } from '../firebase.js';
import { sanitizeId } from '../utils/utils.js';

export const etapaManager = {
  async gerarEtapa(lojaId, contagemId, tipo = 'subcategoria') {
    const etapaId = `etapa_${Date.now()}`;
    const contagemRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId);

    await contagemRef.update({ etapaAtual: etapaId });

    const etapaRef = contagemRef.collection('etapas').doc(etapaId);
    await etapaRef.set({
      tipo,
      criadaEm: new Date().toISOString()
    });

    if (tipo === 'subcategoria') {
      const baseSnap = await contagemRef.collection('baseProdutos').get();
      const agrupados = {};

      baseSnap.forEach(doc => {
        const item = doc.data();
        if (item.status === 'divergente') {
          const sub = item.subCategoria || 'sem_sub';
          if (!agrupados[sub]) agrupados[sub] = [];
          agrupados[sub].push(item.codigo);
        }
      });

      const pendentesRef = etapaRef.collection('pendentesDistribuir');
      const batch = db.batch();

      Object.entries(agrupados).forEach(([sub, codigos]) => {
        const docId = sanitizeId(sub);
        const ref = pendentesRef.doc(docId);
        batch.set(ref, {
          subcategoria: sub,
          itens: codigos,
          status: { codigo: 'pendente' },
          atribuidoPara: null,
          finalizada: false,
          criadoEm: new Date().toISOString()
        });
      });

      await batch.commit();
    }
  }
};
