import { iniciarLeitorCamera } from './camera.js';
import {
  buscarProdutoBase,
  salvarContagemProduto,
  atribuirSubcategoriaAutomatica,
  finalizarUsuarioSubcategoria,
  listarMinhasContagens
} from './js_classes/contagemManager.js';
import { sanitizeId } from './js_classes/utils.js';

const usuario = sessionStorage.getItem('usuario');
const loja = sessionStorage.getItem('loja');
const contagem = sessionStorage.getItem('contagemAtual');
const etapa = sessionStorage.getItem('etapaAtual');

const txtTipo = document.getElementById('tipoEtapaTexto');
const busca = document.getElementById('inputBusca');
const btnCamera = document.getElementById('btnCamera');
const btnMinhas = document.getElementById('btnMinhasContagens');
const localSelect = document.getElementById('selectLocal');
const infoProduto = document.getElementById('dadosItem');
const divMinhas = document.getElementById('minhasContagensResultado');

btnCamera.onclick = () => iniciarLeitorCamera(c => buscarProduto(c));
busca.onblur = () => buscarProduto(busca.value.trim());
btnMinhas.onclick = mostrarMinhasContagens;

(async () => {
  const tipo = txtTipo.textContent.trim();
  if (tipo === 'subcategoria') {
    document.getElementById('subcategoriaContainer').style.display = 'block';
    const btnNova = document.createElement('button');
    btnNova.textContent = 'Nova Lista';
    btnNova.onclick = puxarNovaLista;
    document.getElementById('formularioContagem').appendChild(btnNova);
    document.getElementById('btnFinalizarSub').onclick = async () => {
      await finalizarUsuarioSubcategoria(loja, contagem, etapa, usuario);
      alert('Sua subcategoria foi finalizada!');
    };
    await puxarListaInicial();
  }
})();

async function buscarProduto(codigo) {
  const item = await buscarProdutoBase(loja, contagem, codigo);
  if (!item) return alert('Produto não encontrado');
  const html = `
    <p><strong>Código:</strong> ${item.codigoProduto}</p>
    <p><strong>Descrição:</strong> ${item.descricao}</p>
    <p><strong>Subcategoria:</strong> ${item.subCategoria}</p>
    <label>Quantidade:</label><input id="inputQuantidade" type="number" />
    <button id="btnSalvarContagem">Salvar</button>`;
  infoProduto.innerHTML = html;
  document.getElementById('btnSalvarContagem').onclick = async () => {
    const qtd = parseInt(document.getElementById('inputQuantidade').value);
    if (!qtd || !localSelect.value) return alert('Informe local + quantidade');
    await salvarContagemProduto(loja, contagem, etapa, usuario, item, qtd, localSelect.value);
    alert('Registro gravado');
  };
}

async function mostrarMinhasContagens() {
  const dados = await listarMinhasContagens(loja, contagem, etapa, usuario, localSelect.value);
  divMinhas.innerHTML = dados.length
    ? '<ul>' + dados.map(it => `<li>${it.codigoProduto} (${it.quantidade})</li>`).join('') + '</ul>'
    : '<p>Nenhum item contado ainda.</p>';
}

async function puxarListaInicial() {
  const lista = await atribuirSubcategoriaAutomatica(loja, contagem, etapa, usuario);
  if (!lista.length) return alert('Nenhuma subcategoria disponível');
  mostrarLista(lista.shift());
}

async function puxarNovaLista() {
  await puxarListaInicial();
}

function mostrarLista(listaUsuario) {
  subCategoriaAtual = sanitizeId(listaUsuario[0].subCategoria);
  const container = document.getElementById('listaSubcategoria');
  document.getElementById('infoSubcategoria').textContent = `🔎 Subcategoria: ${subCategoriaAtual.replaceAll('__', '/')}`;
  container.innerHTML = `<h3>${listaUsuario.length} itens</h3><ul>` + listaUsuario.map(c => `<li>${c}</li>`).join('') + '</ul>';
}
