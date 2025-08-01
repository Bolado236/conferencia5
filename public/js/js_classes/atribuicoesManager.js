import { db } from '../firebase.js';
import { doc, updateDoc, deleteField, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function removerAtribuicao(loja, contagem, etapa, subKey) {
  const pendRef = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  await updateDoc(pendRef, { atribuidoPara: null });
}

export async function atribuirUsuario(loja, contagem, etapa, subKey, usuario) {
  const pendRef = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  await updateDoc(pendRef, { atribuidoPara: usuario });
}

export async function trocarAtribuicao(loja, contagem, etapa, subKey, novoUsuario) {
  const pendRef = doc(db, `conferencias/${loja}/contagens/${contagem}/etapas/${etapa}/pendentesDistribuir/${subKey}`);
  await updateDoc(pendRef, { atribuidoPara: novoUsuario });
}
