/* Categorias */

async function iniciarCategorias() {
  await exigirLogin();
  montarLayout("Categorias");
  const user = await usuarioAtual();
  document.getElementById("usuario-email").textContent = user.email;

  const el = (id) => document.getElementById(id);
  let categorias = [];
  let editandoId = null;

  async function carregar() {
    categorias = await listar("categorias", { ordem: "nome", asc: true });
    renderizar();
  }

  function renderizar() {
    const tipo = el("filtro-tipo").value;
    const lista = categorias.filter((c) => !tipo || c.tipo === tipo);
    el("qtd-receita").textContent = categorias.filter((c) => c.tipo === "receita").length;
    el("qtd-despesa").textContent = categorias.filter((c) => c.tipo === "despesa").length;

    if (!lista.length) {
      el("corpo-tabela").innerHTML = `<tr><td colspan="4"><div class="vazio">Nenhuma categoria cadastrada.</div></td></tr>`;
      return;
    }

    el("corpo-tabela").innerHTML = lista
      .map(
        (c) => `
      <tr>
        <td><span class="ponto" style="background:${c.cor}"></span><strong>${c.nome}</strong></td>
        <td><span class="tag ${c.tipo === "receita" ? "tag-verde" : "tag-vermelho"}">${c.tipo}</span></td>
        <td><code>${c.cor}</code></td>
        <td style="white-space:nowrap">
          <button class="btn btn-cinza btn-mini" data-editar="${c.id}">Editar</button>
          <button class="btn btn-perigo btn-mini" data-excluir="${c.id}">Excluir</button>
        </td>
      </tr>`
      )
      .join("");
  }

  function abrirFormulario(c) {
    editandoId = c ? c.id : null;
    el("modal-titulo").textContent = c ? "Editar categoria" : "Nova categoria";
    el("f-nome").value = c ? c.nome : "";
    el("f-tipo").value = c ? c.tipo : "despesa";
    el("f-cor").value = c ? c.cor : "#22c55e";
    abrirModal("modal");
  }

  el("btn-novo").onclick = () => abrirFormulario(null);
  el("btn-cancelar").onclick = () => fecharModal("modal");
  el("filtro-tipo").addEventListener("change", renderizar);

  el("corpo-tabela").addEventListener("click", async (e) => {
    const d = e.target.dataset;
    if (d.editar) abrirFormulario(categorias.find((c) => c.id === d.editar));
    if (d.excluir && (await excluir("categorias", d.excluir))) carregar();
  });

  el("form").onsubmit = async (e) => {
    e.preventDefault();
    const registro = {
      nome: el("f-nome").value.trim(),
      tipo: el("f-tipo").value,
      cor: el("f-cor").value,
    };
    if (await salvar("categorias", registro, editandoId)) {
      fecharModal("modal");
      carregar();
    }
  };

  carregar();
}
