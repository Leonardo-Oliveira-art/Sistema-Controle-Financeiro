/* Página genérica de lançamentos: usada por Receitas e Despesas. */

async function iniciarLancamentos(cfg) {
  // cfg = { tabela: 'receitas'|'despesas', titulo, tipoCategoria, comTipoDespesa }
  await exigirLogin();
  montarLayout(cfg.titulo);
  const user = await usuarioAtual();
  document.getElementById("usuario-email").textContent = user.email;

  let categorias = [];
  let itens = [];
  let editandoId = null;

  const el = (id) => document.getElementById(id);

  async function carregar() {
    categorias = await listar("categorias", { ordem: "nome", asc: true });
    itens = await listar(cfg.tabela, { select: "*, categorias(nome,cor)", ordem: "data" });
    preencherCategorias();
    renderizar();
  }

  function preencherCategorias() {
    const lista = categorias.filter((c) => c.tipo === cfg.tipoCategoria);
    el("f-categoria").innerHTML =
      '<option value="">Sem categoria</option>' +
      lista.map((c) => `<option value="${c.id}">${c.nome}</option>`).join("");
    el("filtro-categoria").innerHTML =
      '<option value="">Todas as categorias</option>' +
      lista.map((c) => `<option value="${c.id}">${c.nome}</option>`).join("");
  }

  function filtrados() {
    const busca = el("filtro-busca").value.toLowerCase();
    const cat = el("filtro-categoria").value;
    const de = el("filtro-de").value;
    const ate = el("filtro-ate").value;
    return itens.filter((i) => {
      if (busca && !String(i.titulo).toLowerCase().includes(busca)) return false;
      if (cat && i.categoria_id !== cat) return false;
      if (de && i.data < de) return false;
      if (ate && i.data > ate) return false;
      return true;
    });
  }

  function renderizar() {
    const lista = filtrados();
    const total = lista.reduce((s, i) => s + Number(i.valor), 0);
    el("total").textContent = formatarBRL(total);
    el("qtd").textContent = lista.length;

    if (!lista.length) {
      el("corpo-tabela").innerHTML = `<tr><td colspan="6"><div class="vazio">Nenhum registro encontrado.</div></td></tr>`;
      return;
    }

    el("corpo-tabela").innerHTML = lista
      .map(
        (i) => `
      <tr>
        <td>${formatarData(i.data)}</td>
        <td><strong>${i.titulo}</strong>${i.descricao ? `<br><span style="color:var(--cinza-texto);font-size:12px">${i.descricao}</span>` : ""}</td>
        <td>${i.categorias ? `<span class="ponto" style="background:${i.categorias.cor}"></span>${i.categorias.nome}` : "—"}</td>
        ${cfg.comTipoDespesa ? `<td><span class="tag tag-azul">${i.tipo}</span></td>` : ""}
        <td class="${cfg.tabela === "receitas" ? "verde" : "vermelho"}"><strong>${formatarBRL(i.valor)}</strong></td>
        <td style="white-space:nowrap">
          <button class="btn btn-cinza btn-mini" data-editar="${i.id}">Editar</button>
          <button class="btn btn-perigo btn-mini" data-excluir="${i.id}">Excluir</button>
        </td>
      </tr>`
      )
      .join("");
  }

  function abrirFormulario(item) {
    editandoId = item ? item.id : null;
    el("modal-titulo").textContent = item ? "Editar lançamento" : "Novo lançamento";
    el("f-titulo").value = item ? item.titulo : "";
    el("f-valor").value = item ? item.valor : "";
    el("f-data").value = item ? item.data : hojeISO();
    el("f-categoria").value = item ? item.categoria_id || "" : "";
    el("f-descricao").value = item ? item.descricao || "" : "";
    if (cfg.comTipoDespesa) el("f-tipo").value = item ? item.tipo : "variavel";
    abrirModal("modal");
  }

  // eventos
  el("btn-novo").onclick = () => abrirFormulario(null);
  el("btn-cancelar").onclick = () => fecharModal("modal");
  ["filtro-busca", "filtro-categoria", "filtro-de", "filtro-ate"].forEach((id) => {
    el(id).addEventListener("input", renderizar);
  });

  el("corpo-tabela").addEventListener("click", async (e) => {
    const editar = e.target.dataset.editar;
    const excluirId = e.target.dataset.excluir;
    if (editar) abrirFormulario(itens.find((i) => i.id === editar));
    if (excluirId && (await excluir(cfg.tabela, excluirId))) carregar();
  });

  el("form").onsubmit = async (e) => {
    e.preventDefault();
    const registro = {
      titulo: el("f-titulo").value.trim(),
      valor: Number(el("f-valor").value),
      data: el("f-data").value,
      categoria_id: el("f-categoria").value || null,
      descricao: el("f-descricao").value.trim() || null,
    };
    if (cfg.comTipoDespesa) registro.tipo = el("f-tipo").value;
    if (await salvar(cfg.tabela, registro, editandoId)) {
      fecharModal("modal");
      carregar();
    }
  };

  carregar();
}
