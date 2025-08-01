import { db } from '../firebase.js';

export const usuarioManager = {
  async cadastrarUsuario({ usuario, senha, loja, tipo }) {
    const payload = {
      usuario,
      senha,
      loja,
      tipo,
      criadoEm: new Date().toISOString()
    };

    await db.collection('usuarios').add(payload);
  },

  async login(usuario, senha, loja) {
    const snapshot = await db.collection('usuarios')
      .where('usuario', '==', usuario)
      .where('senha', '==', senha)
      .get();

    if (snapshot.empty) {
      throw new Error('Usuário ou senha inválidos');
    }

    const userData = snapshot.docs[0].data();

    // Verifica se o usuário pode acessar a loja
    if (userData.loja !== loja && userData.loja !== 'all') {
      throw new Error('Acesso não permitido para essa loja');
    }

    return userData;
  },

  async listarUsuarios() {
    const snapshot = await db.collection('usuarios').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
