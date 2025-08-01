import { db } from '../firebase.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function finalizarSubcategoriaManual(loja, contagem, etapa, subKey, usuario = 'admin') {
  const ref = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  await setDoc(ref, {
    finalizada: true,
    finalizadoPor: usuario,
    finalizadoEm: new Date().toISOString()
  }, { merge: true });
}

export async function adicionarItem(loja, contagem, etapa, subKey, codigoProduto) {
  const ref = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  const snap = await getDoc(ref);
  const dados = snap.data();
  if (!dados.itens.includes(codigoProduto)) {
    dados.itens.push(codigoProduto);
    dados.status[codigoProduto] = 'divergente';
    await setDoc(ref, dados, { merge: true });
  }
}

export async function atribuirParaUsuario(loja, contagem, etapa, subKey, usuario) {
  const ref = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  await setDoc(ref, { atribuidoPara: usuario }, { merge: true });
  const snap = await getDoc(ref);
  const dados = snap.data();
  await setDoc(doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/listagensValidas/${usuario}`), {
    itens: dados.itens,
    subCategoria: dados.subcategoria || subKey,
    finalizado: false,
    atribuidaManualmente: true,
    atribuidaEm: new Date().toISOString()
  });
}

export async function removerAtribuicao(loja, contagem, etapa, subKey) {
  const ref = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  await setDoc(ref, { atribuidoPara: null }, { merge: true });
}
