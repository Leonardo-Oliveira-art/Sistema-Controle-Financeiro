/* Dashboard: cartões + gráficos (Chart.js) */

async function iniciarDashboard() {
  await exigirLogin();
  montarLayout("Dashboard");
  const user = await usuarioAtual();
  document.getElementById("usuario-email").textContent = user.email;

  const receitas = await listar("receitas", { select: "*, categorias(nome,cor)", ordem: "data" });
  const despesas = await listar("despesas", { select: "*, categorias(nome,cor)", ordem: "data" });
  const contas = await listar("contas_pagar", { ordem: "vencimento", asc: true });

  const inicio = inicioDoMes();
  const soma = (arr) => arr.reduce((s, i) => s + Number(i.valor), 0);
  const recMes = soma(receitas.filter((r) => r.data >= inicio));
  const despMes = soma(despesas.filter((d) => d.data >= inicio));
  const pendentes = contas.filter((c) => c.situacao !== "pago");

  document.getElementById("card-receitas").textContent = formatarBRL(recMes);
  document.getElementById("card-despesas").textContent = formatarBRL(despMes);
  document.getElementById("card-saldo").textContent = formatarBRL(recMes - despMes);
  document.getElementById("card-contas").textContent = formatarBRL(soma(pendentes));
  document.getElementById("card-contas-qtd").textContent = pendentes.length + " conta(s) em aberto";

  /* ----- Gráfico 1: evolução dos últimos 6 meses ----- */
  const meses = [];
  const base = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    meses.push({
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }),
      prefixo: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  const porMes = (arr, p) => soma(arr.filter((i) => String(i.data).startsWith(p)));

  new Chart(document.getElementById("grafico-evolucao"), {
    type: "bar",
    data: {
      labels: meses.map((m) => m.rotulo),
      datasets: [
        { label: "Receitas", data: meses.map((m) => porMes(receitas, m.prefixo)), backgroundColor: "#22c55e", borderRadius: 6 },
        { label: "Despesas", data: meses.map((m) => porMes(despesas, m.prefixo)), backgroundColor: "#ef4444", borderRadius: 6 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
  });

  /* ----- Gráfico 2: despesas por categoria (mês atual) ----- */
  const agrupado = {};
  despesas
    .filter((d) => d.data >= inicio)
    .forEach((d) => {
      const nome = d.categorias ? d.categorias.nome : "Sem categoria";
      const cor = d.categorias ? d.categorias.cor : "#9ca3af";
      agrupado[nome] = agrupado[nome] || { valor: 0, cor };
      agrupado[nome].valor += Number(d.valor);
    });
  const nomes = Object.keys(agrupado);

  new Chart(document.getElementById("grafico-categorias"), {
    type: "doughnut",
    data: {
      labels: nomes.length ? nomes : ["Sem dados"],
      datasets: [
        {
          data: nomes.length ? nomes.map((n) => agrupado[n].valor) : [1],
          backgroundColor: nomes.length ? nomes.map((n) => agrupado[n].cor) : ["#e5e7eb"],
        },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
  });

  /* ----- Próximos vencimentos ----- */
  const proximas = pendentes.slice(0, 6);
  document.getElementById("proximas-contas").innerHTML = proximas.length
    ? proximas
        .map(
          (c) => `
      <tr>
        <td>${formatarData(c.vencimento)}</td>
        <td>${c.nome}</td>
        <td><span class="tag ${c.vencimento < hojeISO() ? "tag-vermelho" : "tag-amarelo"}">${c.vencimento < hojeISO() ? "vencido" : "pendente"}</span></td>
        <td><strong>${formatarBRL(c.valor)}</strong></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4"><div class="vazio">Nenhuma conta em aberto.</div></td></tr>`;
}
