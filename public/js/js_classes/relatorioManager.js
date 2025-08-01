import { db } from '../firebase.js';
import {
  collection, getDocs
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function obterItensContados(loja, contagem) {
  const snap = await getDocs(collection(db, `conferencias/${loja}/contagens/${contagem}/contagens`));
  return snap.docs.map(d => d.data());
}

export async function obterItensNaoContados(loja, contagem) {
  const baseSnap = await getDocs(collection(db, `conferencias/${loja}/contagens/${contagem}/baseProdutos`));
  const contSnap = await getDocs(collection(db, `conferencias/${loja}/contagens/${contagem}/contagens`));
  const baseMap = new Map(baseSnap.docs.map(d => [d.id, d.data()]));
  contSnap.docs.forEach(d => baseMap.delete(d.data().codigoProduto));
  return Array.from(baseMap.values());
}

export async function obterDivergentes(loja, contagem) {
  const resultado = [];
  const baseSnap = await getDocs(collection(db, `conferencias/${loja}/contagens/${contagem}/baseProdutos`));
  const contSnap = await getDocs(collection(db, `conferencias/${loja}/contagens/${contagem}/contagens`));
  const totals = {};
  contSnap.docs.forEach(d => {
    const c = d.data();
    totals[c.codigoProduto] = (totals[c.codigoProduto] || 0) + Number(c.quantidade || 0);
  });

  baseSnap.docs.forEach(d => {
    const p = d.data();
    const total = totals[p.codigoProduto] || 0;
    if (total !== p.quantidade) resultado.push({ ...p, total, status: 'divergente' });
  });
  return resultado;
}
