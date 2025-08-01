import { db } from '../firebase.js';
import { getDocs, collection } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function getItensDivergentes(loja, contagem) {
  const resultado = [];
  const baseSnap = await getDocs(collection(db, 'conferencias', loja, 'contagens', contagem, 'baseProdutos'));
  const etapasSnap = await getDocs(collection(db, 'conferencias', loja, 'contagens', contagem, 'etapas'));

  for (const d of baseSnap.docs) {
    const prod = d.data();
    let total = 0;
    for (const et of etapasSnap.docs) {
      const contSnap = await getDocs(collection(db, `conferencias/${loja}/contagens/${contagem}/etapas/${et.id}/contagens`));
      contSnap.forEach(c => total += Number(c.data().quantidade || 0));
    }
    resultado.push({
      codigoProduto: prod.codigoProduto,
      subCategoria: prod.subCategoria,
      status: prod.quantidade === total ? 'finalizado' : 'divergente'
    });
  }
  return resultado;
}
