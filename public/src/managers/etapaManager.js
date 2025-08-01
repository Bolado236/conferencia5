import { db } from '../firebase.js';
import { sanitizeId } from './utils.js';

export const etapaManager = {
  async gerarEtapa(lojaId, contagemId, tipo = 'subcategoria') {
    const contagemRef = db.collection('conferencias').doc(lojaId).collection('contagens').doc(contagemId);
    const etapaId = `etapa_${Date.now()}`;

    // Criar nova etapa
    const novaEtapaRef = contagemRef.collection('etapas').doc(etapaId);
    await novaEtapaRef.set({
      tipo,
      criadaEm: new Date().toISOString()
    });

    // Atualizar etapaAtual
    await contagemRef.update({ etapaAtual: etapaId });

    // Se for do tipo "subcategoria", gerar pendentes agrupados por subCategoria
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

      const pendentesRef = novaEtapaRef.collection('pendentesDistribuir');
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
