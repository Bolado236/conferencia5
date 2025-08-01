import { db } from '../firebase.js';

export const firestoreService = {
  async getLojas() {
    const snapshot = await db.collection('lojas').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getContagens(lojaId) {
    const snapshot = await db.collection('conferencias').doc(lojaId).collection('contagens').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async saveUsuario(usuario) {
    return db.collection('usuarios').add(usuario);
  }
};
