import { db } from '../firebase.js';
import { collection, addDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function cadastrarUsuario(usuario, senha, tipo, loja) {
  const usuariosRef = collection(db, 'usuarios');
  await addDoc(usuariosRef, {
    usuario,
    senha,
    tipo,
    loja,
    criadoEm: new Date().toISOString()
  });
}

export async function atualizarLojaDoUsuario(userId, novaLoja) {
  const userRef = doc(db, 'usuarios', userId);
  await setDoc(userRef, { loja: novaLoja }, { merge: true });
}
