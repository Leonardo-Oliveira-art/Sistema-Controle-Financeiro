/* Contas a pagar / contas pagas */

async function iniciarContas(situacaoPagina) {
  const pagas = situacaoPagina === "pago";
  const titulo = pagas ? "Contas Pagas" : "Contas a Pagar";
  await exigirLogin();
  montarLayout(titulo);
  const user = await usuarioAtual();
  document.getElementById("usuario-email").textContent = user.email;

  const el = (id) => document.getElementById(id);
  let categorias = [];
  let contas = [];
  let editandoId = null;

  async function carregar() {
    categorias = await listar("categorias", { ordem: "nome", asc: true });
    const todas = await listar("contas_pagar", { select: "*, categorias(nome,cor)", ordem: "vencimento", asc: true });
    contas = todas.filter((c) => (pagas ? c.situacao === "pago" : c.situacao !== "pago"));
    if (el("f-categoria")) {
      const lista = categorias.filter((c) => c.tipo === "despesa");
      el("f-categoria").innerHTML =
        '<option value="">Sem categoria</option>' + lista.map((c) => `<option value="${c.id}">${c.nome}</option>`).join("");
    }
    renderizar();
  }

  function situacaoReal(c) {
    if (c.situacao === "pago") return "pago";
    return c.vencimento < hojeISO() ? "vencido" : "pendente";
  }

  function filtradas() {
    const busca = el("filtro-busca").value.toLowerCase();
    const sit = el("filtro-situacao") ? el("filtro-situacao").value : "";
    return contas.filter((c) => {
      if (busca && !`${c.nome} ${c.fornecedor || ""}`.toLowerCase().includes(busca)) return false;
      if (sit && situacaoReal(c) !== sit) return false;
      return true;
    });
  }

  function renderizar() {
    const lista = filtradas();
    const total = lista.reduce((s, c) => s + Number(c.valor), 0);
    el("total").textContent = formatarBRL(total);
    el("qtd").textContent = lista.length;
    if (el("vencidas")) {
      el("vencidas").textContent = lista.filter((c) => situacaoReal(c) === "vencido").length;
    }

    if (!lista.length) {
      el("corpo-tabela").innerHTML = `<tr><td colspan="7"><div class="vazio">Nenhuma conta encontrada.</div></td></tr>`;
      return;
    }

    const tags = { pago: "tag-verde", pendente: "tag-amarelo", vencido: "tag-vermelho" };
    el("corpo-tabela").innerHTML = lista
      .map((c) => {
        const s = situacaoReal(c);
        return `
      <tr>
        <td>${formatarData(pagas ? c.pago_em || c.vencimento : c.vencimento)}</td>
        <td><strong>${c.nome}</strong>${c.fornecedor ? `<br><span style="color:var(--cinza-texto);font-size:12px">${c.fornecedor}</span>` : ""}</td>
        <td>${c.categorias ? `<span class="ponto" style="background:${c.categorias.cor}"></span>${c.categorias.nome}` : "—"}</td>
        <td><span class="tag ${c.prioridade === "alta" ? "tag-vermelho" : c.prioridade === "media" ? "tag-amarelo" : "tag-azul"}">${c.prioridade}</span></td>
        <td><span class="tag ${tags[s]}">${s}</span></td>
        <td><strong>${formatarBRL(c.valor)}</strong></td>
        <td style="white-space:nowrap">
          ${pagas
            ? `<button class="btn btn-cinza btn-mini" data-reabrir="${c.id}">Reabrir</button>`
            : `<button class="btn btn-mini" data-pagar="${c.id}">Pagar</button>
               <button class="btn btn-cinza btn-mini" data-editar="${c.id}">Editar</button>`}
          <button class="btn btn-perigo btn-mini" data-excluir="${c.id}">Excluir</button>
        </td>
      </tr>`;
      })
      .join("");
  }

  function abrirFormulario(c) {
    editandoId = c ? c.id : null;
    el("modal-titulo").textContent = c ? "Editar conta" : "Nova conta";
    el("f-nome").value = c ? c.nome : "";
    el("f-valor").value = c ? c.valor : "";
    el("f-vencimento").value = c ? c.vencimento : hojeISO();
    el("f-fornecedor").value = c ? c.fornecedor || "" : "";
    el("f-categoria").value = c ? c.categoria_id || "" : "";
    el("f-prioridade").value = c ? c.prioridade : "media";
    el("f-parcelas").value = c ? c.numero_parcelas : 1;
    el("f-observacoes").value = c ? c.observacoes || "" : "";
    abrirModal("modal");
  }

  if (el("btn-novo")) el("btn-novo").onclick = () => abrirFormulario(null);
  if (el("btn-cancelar")) el("btn-cancelar").onclick = () => fecharModal("modal");
  el("filtro-busca").addEventListener("input", renderizar);
  if (el("filtro-situacao")) el("filtro-situacao").addEventListener("change", renderizar);

  el("corpo-tabela").addEventListener("click", async (e) => {
    const d = e.target.dataset;
    if (d.editar) abrirFormulario(contas.find((c) => c.id === d.editar));
    if (d.pagar && (await salvar("contas_pagar", { situacao: "pago", pago_em: hojeISO() }, d.pagar))) carregar();
    if (d.reabrir && (await salvar("contas_pagar", { situacao: "pendente", pago_em: null }, d.reabrir))) carregar();
    if (d.excluir && (await excluir("contas_pagar", d.excluir))) carregar();
  });

  if (el("form")) {
    el("form").onsubmit = async (e) => {
      e.preventDefault();
      const parcelas = Number(el("f-parcelas").value) || 1;
      const registro = {
        nome: el("f-nome").value.trim(),
        valor: Number(el("f-valor").value),
        vencimento: el("f-vencimento").value,
        fornecedor: el("f-fornecedor").value.trim() || null,
        categoria_id: el("f-categoria").value || null,
        prioridade: el("f-prioridade").value,
        parcelada: parcelas > 1,
        numero_parcelas: parcelas,
        observacoes: el("f-observacoes").value.trim() || null,
      };
      if (await salvar("contas_pagar", registro, editandoId)) {
        fecharModal("modal");
        carregar();
      }
    };
  }

  carregar();
}
