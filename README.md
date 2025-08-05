# 📦 Sistema de Conferência de Estoque

Sistema web em HTML + CSS + Javascript para controle de contagens de estoque em lojas físicas, com suporte a múltiplos usuários, múltiplas etapas e relatórios dinâmicos. Totalmente integrado ao Firebase Firestore e hospedado via Firebase Hosting.

---

## 🧰 Funcionalidades

- 🔐 Login por usuário/senha + seleção de loja (sem Firebase Auth)
- 🧑‍💼 Painel administrativo para criação de contagens e usuários
- 📦 Tela de contagem com scanner de código de barras (QuaggaJS)
- 🧠 Busca inteligente por descrição com Fuse.js
- 🔁 Contagem iterativa com etapas controladas
- 📊 Relatórios de itens contados, não contados e divergentes
- 🔄 Atualização em tempo real via Firestore

---

## 📁 Estrutura de Pastas

.
├── public/
│ ├── index.html # Tela de login
│ ├── hub.html # Seleção de contagem
│ ├── contagem.html # Contagem pelos usuários
│ ├── admin.html # Painel administrativo
│ └── relatorio.html # Relatórios administrativos
├── src/
│ ├── pages/ # Scripts de cada tela
│ ├── components/ # UI reutilizáveis (scanner, toast, dropdown)
│ ├── managers/ # Lógica principal (contagem, etapas, usuários, etc)
│ ├── services/ # Firestore, auth e config abstraída
│ └── utils/ # Funções auxiliares (string, data, DOM)
└── styles/ # CSS por componente e página

yaml
Copiar
Editar

---

## 🚀 Como rodar o projeto

1. Clone o projeto:
   ```bash
   git clone https://github.com/seu-usuario/seu-projeto.git
Configure o Firebase:

Crie um projeto no Firebase Console

Ative Firestore (modo test)

Adicione um app web e copie suas firebaseConfig

Crie o arquivo firebase.js com:

js
Copiar
Editar
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
Rode localmente com Live Server ou hospedagem:

bash
Copiar
Editar
npm install -g live-server
live-server public
Ou publique no Firebase Hosting:

bash
Copiar
Editar
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
🧠 Convenções
Todos os usuários estão na coleção usuarios

Todas as contagens ficam em conferencias/{loja}/contagens/{id}

Cada etapa tem seus dados em etapas/{etapaId}/...

sessionStorage é usado para armazenar usuário e contagem atual

Autenticação caseira via Firestore, controlada via loginManager.js

📌 Extensões Futuras
🔄 Exportação de relatórios em CSV/PDF

📊 Gráficos com Chart.js para análise

📱 Suporte a PWA/offline com Firestore cache

🕵️‍♂️ Log de auditoria por ação

🧑‍💻 Feito por [Seu Nome ou Equipe]