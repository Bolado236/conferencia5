import { db } from './firebase.js';
import { lojas } from './lojas.js';
import { converterXLSXParaJSON } from './xlsxConverter.js';
import { gerarEtapa } from './js_classes/etapaManager.js';
import {
  finalizarSubcategoriaManual,
  adicionarItem,
  atribuirParaUsuario,
  removerAtribuicao
} from './js_classes/subcategoriaManager.js';
import { cadastrarUsuario } from './js_classes/usuarioManager.js';
import {
  obterItensContados,
  obterItensNaoContados,
  obterDivergentes
} from './js_classes/relatorioManager.js';

const selLoja = document.getElementById('selectLoja');
const selContagem = document.getElementById('selectContagemExistente');
const selTipoEtapa = document.getElementById('selectTipoEtapa');
const selLojaUsuario = document.getElementById('selectLojaUsuario');
const ctlContagem = document.getElementById('ctlContagem');
const ctlEtapa = document.getElementById('ctlEtapa');
const ctlPendentes = document.getElementById('ctlPendentes');

const btnGerarEtapa = document.getElementById('btnGerarEtapa');
const btnFinalizarManual = document.getElementById('btnFinalizarManual');
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const btnAtribuirUsuario = document.getElementById('btnAtribuirUsuario');
const btnRemoverAtrib = document.getElementById('btnRemoverAtribuicao');
const formCadastroUsuario = document.getElementById('formCadastroUsuario');
const btnRelContados = document.getElementById('btnRelatorioItensContados');
const btnRelNao = document.getElementById('btnRelatorioItensNaoContados');
const btnRelDiv = document.getElementById('btnRelatorioDivergencias');
const relRes = document.getElementById('relatorioResultado');
const btnVoltarHub = document.getElementById('btnVoltarHub');
const btnCriarContagem = document.getElementById('btnCriarContagemCompleta');
const btnNovaContagem = document.getElementById('btnNovaContagem');
const selModelo = document.getElementById('selectModelo');
const inputNomeContagem = document.getElementById('inputNomeContagem');
const inputXLSX = document.getElementById('inputXLSX');

let lojaAtual = sessionStorage.getItem('loja') || '';

function populaLojas(drop) {
  drop.innerHTML = lojas.map(l => `<option value="${l.codigo}">${l.codigo} - ${l.nome}</option>`).join('');
}
populaLojas(selLoja);
populaLojas(selLojaUsuario);

async function carregaContagens(elems) {
  const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
  if (!lojaAtual) return;
  const snap = await getDocs(collection(db, 'conferencias', lojaAtual, 'contagens'));
  elems.forEach(el => {
    el.innerHTML = '<option value="">-- selecione --</option>';
    snap.forEach(d => {
      el.innerHTML += `<option value="${d.id}">${d.id}</option>`;
    });
  });
}
carregaContagens([selContagem, ctlContagem]);

btnGerarEtapa.onclick = async () => {
  const cont = selContagem.value;
  const tipo = selTipoEtapa.value?.trim();
  const nome = prompt("Nome da nova etapa:")?.trim().replace(/\s+/g, '_');
  if (!cont || !tipo || !nome) return alert('Preencha todos os campos!');
  await gerarEtapa(lojaAtual, cont, nome, tipo);
  alert('Nova etapa gerada com sucesso!');
  carregaContagens([selContagem, ctlContagem]);
};

ctlContagem.onchange = async () => {
  const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
  ctlEtapa.innerHTML = '<option value="">-- selecione etapa --</option>';
  ctlPendentes.innerHTML = '<option value="">-- pendentes --</option>';
  const snap = await getDocs(collection(db, 'conferencias', lojaAtual, 'contagens', ctlContagem.value, 'etapas'));
  snap.forEach(d => ctlEtapa.innerHTML += `<option value="${d.id}">${d.id}</option>`);
};

ctlEtapa.onchange = async () => {
  const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
  ctlPendentes.innerHTML = '<option value="">-- pendentes --</option>';
  const snap = await getDocs(collection(db, 'conferencias', lojaAtual, 'contagens', ctlContagem.value, 'etapas', ctlEtapa.value, 'pendentesDistribuir'));
  snap.forEach(d => ctlPendentes.innerHTML += `<option value="${d.id}">${d.data().subcategoria} (${d.data().itens.length})</option>`);
};

btnFinalizarManual.onclick = () =>
  finalizarSubcategoriaManual(lojaAtual, ctlContagem.value, ctlEtapa.value, ctlPendentes.value);

btnAdicionarItem.onclick = () =>
  adicionarItem(lojaAtual, ctlContagem.value, ctlEtapa.value, ctlPendentes.value, prompt('Código do produto:').trim());

btnAtribuirUsuario.onclick = () =>
  atribuirParaUsuario(lojaAtual, ctlContagem.value, ctlEtapa.value, ctlPendentes.value, prompt('Usuário:').trim());

btnRemoverAtrib.onclick = () =>
  removerAtribuicao(lojaAtual, ctlContagem.value, ctlEtapa.value, ctlPendentes.value);

formCadastroUsuario.onsubmit = async e => {
  e.preventDefault();
  await cadastrarUsuario(
    document.getElementById('novoUsuario').value.trim(),
    document.getElementById('novaSenha').value,
    document.getElementById('tipoUsuario').value,
    selLojaUsuario.value
  );
  alert("Usuário cadastrado!");
};

btnRelContados.onclick = async () => {
  const dados = await obterItensContados(lojaAtual, selContagem.value);
  relRes.innerHTML = JSON.stringify(dados, null, 2);
};
btnRelNao.onclick = async () => {
  const dados = await obterItensNaoContados(lojaAtual, selContagem.value);
  relRes.innerHTML = JSON.stringify(dados, null, 2);
};
btnRelDiv.onclick = async () => {
  const dados = await obterDivergentes(lojaAtual, selContagem.value);
  relRes.innerHTML = JSON.stringify(dados, null, 2);
};

btnVoltarHub.onclick = () => window.location.href = 'hub.html';

btnNovaContagem.onclick = () => {
  document.getElementById('formNovaContagem').style.display =
    document.getElementById('formNovaContagem').style.display === 'block' ? 'none' : 'block';
};

btnCriarContagem.onclick = async () => {
  const loja = selLoja.value, nome = inputNomeContagem.value.trim().replace(/\s+/g, '_');
  const modelo = selModelo.value, file = inputXLSX.files[0];
  if (!loja || !nome || !modelo || !file) return alert('Preencha todos os campos!');
  const base = await converterXLSXParaJSON(file);
  const et = 'contagem1';
  const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js');
  await setDoc(doc(db, 'conferencias', loja, 'contagens', nome), { criadaEm: new Date().toISOString(), etapaAtual: et });
  await setDoc(doc(db, `conferencias/${loja}/contagens/${nome}/etapas/${et}`), { tipo: modelo, criadaEm: new Date().toISOString() });
  for (const it of base) {
    await setDoc(doc(db, `conferencias/${loja}/contagens/${nome}/baseProdutos/${it.codigoProduto}`), it);
  }
  lojaAtual = loja;
  sessionStorage.setItem('loja', loja);
  alert('Contagem criada com sucesso!');
  carregaContagens([selContagem, ctlContagem]);
};
