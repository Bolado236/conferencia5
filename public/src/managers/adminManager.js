import { db } from '../firebase.js';
import { converterXLSXParaJSON } from '../xlsxConverter.js'; // sua função já existente
import { sanitizeId } from '../js_classes/utils.js';

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

    const novaRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(nome);

    await novaRef.set({
      criadaEm: new Date().toISOString(),
      etapaAtual: 'etapa1',
      modelo
    });

    const etapaRef = novaRef.collection('etapas').doc('etapa1');
    await etapaRef.set({
      criadaEm: new Date().toISOString(),
      tipo: modelo
    });

    const baseDestino = novaRef.collection('baseProdutos');
    const batch = db.batch();

    baseSnap.forEach(doc => {
      const docRef = baseDestino.doc(doc.id);
      batch.set(docRef, doc.data());
    });

    await batch.commit();
  },

  async gerarEtapaSubcategoria(lojaId, contagemId) {
    const etapaId = `etapa_${Date.now()}`;
    const contagemRef = db.collection('conferencias')
      .doc(lojaId)
      .collection('contagens')
      .doc(contagemId);

    const baseSnap = await contagemRef.collection('baseProdutos').get();

    const novaEtapaRef = contagemRef.collection('etapas').doc(etapaId);
    await novaEtapaRef.set({
      criadaEm: new Date().toISOString(),
      tipo: 'subcategoria'
    });

    const agrupados = {};
    baseSnap.forEach(doc => {
      const item = doc.data();
      const sub = item.subCategoria || 'sem_sub';
      if (!agrupados[sub]) agrupados[sub] = [];
      agrupados[sub].push(item.codigo);
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
    await contagemRef.update({ etapaAtual: etapaId });
  },

  async cadastrarUsuario({ usuario, senha, loja, tipo }) {
    const payload = {
      usuario,
      senha,
      loja,
      tipo,
      criadoEm: new Date().toISOString()
    };

    await db.collection('usuarios').add(payload);
  }
};
