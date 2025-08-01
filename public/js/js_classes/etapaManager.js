import { db } from '../firebase.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getItensDivergentes } from './divergenciaManager.js';
import { sanitizeId } from './utils.js';

export async function gerarEtapa(loja, contagem, nomeEtapa, tipo) {
  await setDoc(doc(db, 'conferencias', loja, 'contagens', contagem), { etapaAtual: nomeEtapa }, { merge: true });
  await setDoc(doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${nomeEtapa}`), {
    tipo, criadaEm: new Date().toISOString()
  });

  if (tipo === 'subcategoria') {
    const divergentes = await getItensDivergentes(loja, contagem);
    const buckets = {};
    divergentes.forEach(it => {
      const key = sanitizeId(it.subCategoria || 'SEM_SUB');
      if (!buckets[key]) buckets[key] = { subcategoria: it.subCategoria || 'SEM_SUB', itens: [], status: {} };
      buckets[key].itens.push(it.codigoProduto);
      buckets[key].status[it.codigoProduto] = it.status;
    });
    for (const key in buckets) {
      await setDoc(doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${nomeEtapa}/pendentesDistribuir/${key}`), {
        ...buckets[key],
        atribuidoPara: null,
        finalizada: false,
        criadoEm: new Date().toISOString()
      });
    }
  }
}
