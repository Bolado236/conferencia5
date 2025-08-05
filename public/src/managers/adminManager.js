import { db } from '../firebase.js';
import { converterXLSXParaJSON } from '../xlsxConverter.js';
import { sanitizeId } from '../utils/utils.js';

export const adminManager = {
  async carregarContagens(lojaId, selectElement) {
    const snapshot = await db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .get();

    selectElement.innerHTML = '';
    snapshot.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.id;
      selectElement.appendChild(opt);
    });
  },

  async enviarBaseProdutos(lojaId, file) {
    const json = await converterXLSXParaJSON(file);
    const baseRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc('tempBase')
      .collection('baseProdutos');

    const batch = db.batch();
    json.forEach(produto => {
      const docRef = baseRef.doc(sanitizeId(produto.codigo));
      batch.set(docRef, produto);
    });
    await batch.commit();
  },

  async criarContagem(lojaId, nome, modelo) {
    const baseSnap = await db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc('tempBase')
      .collection('baseProdutos')
      .get();

    const contagemRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(nome);

    await contagemRef.set({
      criadaEm: new Date().toISOString(),
      etapaAtual: 'etapa1',
      modelo
    });

    await contagemRef.collection('etapas').doc('etapa1').set({
      tipo: modelo,
      criadaEm: new Date().toISOString()
    });

    const baseDestino = contagemRef.collection('baseProdutos');
    const batch = db.batch();
    baseSnap.forEach(doc => {
      const dest = baseDestino.doc(doc.id);
      batch.set(dest, doc.data());
    });
    await batch.commit();
  },

  async cadastrarUsuario({ usuario, senha, loja, tipo }) {
    await db.collection('usuarios').add({
      usuario,
      senha,
      loja,
      tipo,
      criadoEm: new Date().toISOString()
    });
  }
};
