import { db } from '../firebase.js';
import { sanitizeId } from './utils.js';

export const subcategoriaManager = {
  async atribuirParaUsuario(lojaId, contagemId, etapaId, subCategoria, userId) {
    const subId = sanitizeId(subCategoria);
    const pendenteRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('pendentesDistribuir')
      .doc(subId);

    await pendenteRef.update({ atribuidoPara: userId });

    const itensDoc = await pendenteRef.get();
    const { itens } = itensDoc.data();

    const userRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('listagensValidas')
      .doc(userId);

    await userRef.set({
      itens,
      subCategoria,
      finalizado: false,
      atribuidaManualmente: true,
      criadaEm: new Date().toISOString()
    });
  },

  async removerAtribuicao(lojaId, contagemId, etapaId, subCategoria) {
    const subId = sanitizeId(subCategoria);
    const pendenteRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('pendentesDistribuir')
      .doc(subId);

    const snapshot = await pendenteRef.get();
    const { atribuidoPara } = snapshot.data();

    if (atribuidoPara) {
      await pendenteRef.update({ atribuidoPara: null });

      const userRef = db.collection('conferencias')
        .doc(lojaId)
        .collection('contagens')
        .doc(contagemId)
        .collection('etapas')
        .doc(etapaId)
        .collection('listagensValidas')
        .doc(atribuidoPara);

      await userRef.delete();
    }
  },

  async adicionarItem(lojaId, contagemId, etapaId, subCategoria, codigoProduto) {
    const subId = sanitizeId(subCategoria);
    const pendenteRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('pendentesDistribuir')
      .doc(subId);

    await pendenteRef.update({
      itens: firebase.firestore.FieldValue.arrayUnion(codigoProduto),
      status: { codigo: 'divergente' }
    });
  },

  async finalizarSubcategoriaManual(lojaId, contagemId, etapaId, subCategoria, userId) {
    const subId = sanitizeId(subCategoria);
    const pendenteRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('pendentesDistribuir')
      .doc(subId);

    await pendenteRef.update({
      finalizada: true,
      atribuidoPara: userId,
      status: { codigo: 'finalizado' }
    });

    const userRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('listagensValidas')
      .doc(userId);

    await userRef.update({
      finalizado: true,
      finalizadoEm: new Date().toISOString()
    });
  }
};
