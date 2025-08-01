import { db } from '../firebase.js';
import {
  getDoc, getDocs, collection, doc, addDoc, setDoc, query, where
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { sanitizeId } from './utils.js';

export async function buscarProdutoBase(loja, contagem, codigo) {
  const snap = await getDoc(doc(db, `conferencias/${loja}/contagens/${contagem}/baseProdutos/${codigo}`));
  if (snap.exists()) return snap.data();

  const q = query(collection(db, `conferencias/${loja}/contagens/${contagem}/baseProdutos`), where('codigoBarras', 'array-contains', codigo));
  const qSnap = await getDocs(q);
  return qSnap.empty ? null : qSnap.docs[0].data();
}

export async function salvarContagemProduto(loja, contagem, etapa, usuario, produto, qtd, local) {
  await addDoc(collection(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/contagens`), {
    usuario, local, quantidade: qtd,
    codigoProduto: produto.codigoProduto,
    descricao: produto.descricao,
    departamento: produto.departamento,
    categoria: produto.categoria,
    subCategoria: produto.subCategoria,
    hora: new Date().toISOString()
  });

  const resumoRef = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/resumo/${produto.codigoProduto}`);
  const snapResumo = await getDoc(resumoRef);
  const atual = snapResumo.exists() ? snapResumo.data().quantidade : 0;
  await setDoc(resumoRef, {
    quantidade: atual + qtd,
    descricao: produto.descricao,
    categoria: produto.categoria,
    subCategoria: produto.subCategoria,
    atualizadoEm: new Date().toISOString()
  }, { merge: true });
}

export async function atribuirSubcategoriaAutomatica(loja, contagem, etapa, usuario) {
  const ref = collection(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir`);
  const snap = await getDocs(ref);
  const pendente = snap.docs.find(d => {
    const data = d.data();
    return !data.finalizada && !data.atribuidoPara &&
      data.itens.filter(c => data.status[c] === 'divergente').length > 0;
  });
  if (!pendente) return [];

  const itens = pendente.data().itens.filter(c => pendente.data().status[c] === 'divergente');
  await setDoc(pendente.ref, { atribuidoPara: usuario }, { merge: true });
  await setDoc(doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/listagensValidas/${usuario}`), {
    subCategoria: pendente.data().subcategoria || pendente.id,
    itens, finalizado: false, criadaEm: new Date().toISOString()
  });

  return itens;
}

export async function finalizarUsuarioSubcategoria(loja, contagem, etapa, usuario) {
  const userRef = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/listagensValidas/${usuario}`);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const sub = snap.data().subCategoria;
  const subId = sanitizeId(sub);
  await setDoc(doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subId}`), {
    finalizada: true,
    finalizadoPor: usuario,
    finalizadoEm: new Date().toISOString()
  }, { merge: true });
  await setDoc(userRef, { finalizado: true }, { merge: true });
}
