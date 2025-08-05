import { db } from '../firebase.js';
import { sanitizeId } from '../utils/utils.js';

export const contagemManager = {
  async carregarProdutosBase(lojaId, contagemId) {
    const snapshot = await db
      .collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('baseProdutos')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async salvarContagemProduto(produto, qtd, user, contagemId, local) {
    const lojaRef = db.collection('conferencias').doc(user.loja);
    const etapaAtualSnap = await lojaRef
      .collection('contagens')
      .doc(contagemId)
      .get();

    const etapaId = etapaAtualSnap.data().etapaAtual;

    const contagemRef = lojaRef
      .collection('contagens')
      .doc(contagemId)
      .collection('etapas')
      .doc(etapaId)
      .collection('contagens')
      .doc();

    await contagemRef.set({
      usuario: user.usuario,
      local,
      quantidade: qtd,
      hora: new Date().toISOString(),
      produto: produto.codigo || produto.id,
      descricao: produto.descricao || '',
      subCategoria: produto.subCategoria || null
    });
  },

  async buscarProdutoBase(lojaId, contagemId, codigo) {
    const ref = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId)
      .collection('baseProdutos')
      .doc(sanitizeId(codigo));

    const doc = await ref.get();
    return doc.exists ? doc.data() : null;
  }
};
