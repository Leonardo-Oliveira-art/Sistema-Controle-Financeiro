/* Utilidades compartilhadas por todas as páginas. */

/* ---------- Formatação ---------- */
function formatarBRL(valor) {
  const n = Number(valor || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso) {
  if (!iso) return "—";
  const [a, m, d] = String(iso).slice(0, 10).split("-");
  return d && m && a ? `${d}/${m}/${a}` : "—";
}

function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function inicioDoMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/* ---------- Toast ---------- */
function toast(msg, tipo) {
  let box = document.getElementById("toasts");
  if (!box) {
    box = document.createElement("div");
    box.id = "toasts";
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = "toast " + (tipo || "");
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ---------- Sessão ---------- */
async function usuarioAtual() {
  const { data } = await db.auth.getUser();
  return data.user || null;
}

/** Bloqueia a página se não estiver logado. Retorna o usuário. */
async function exigirLogin() {
  const user = await usuarioAtual();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}

async function sair() {
  await db.auth.signOut();
  window.location.href = "index.html";
}

/* ---------- Layout (sidebar + topbar) ---------- */
const MENU = [
  { url: "dashboard.html", nome: "Dashboard", icone: "📊" },
  { url: "contas-pagar.html", nome: "Contas a Pagar", icone: "🧾" },
  { url: "contas-pagas.html", nome: "Contas Pagas", icone: "✅" },
  { url: "receitas.html", nome: "Receitas", icone: "📈" },
  { url: "despesas.html", nome: "Despesas", icone: "📉" },
  { url: "categorias.html", nome: "Categorias", icone: "🏷️" },
];

function montarLayout(tituloPagina) {
  const atual = location.pathname.split("/").pop() || "dashboard.html";
  const links = MENU.map(
    (m) =>
      `<a href="${m.url}" class="${m.url === atual ? "ativo" : ""}"><span>${m.icone}</span><span>${m.nome}</span></a>`
  ).join("");

  document.getElementById("sidebar").innerHTML = `
    <div class="sidebar-topo">
      <span class="marca">💰</span>
      <strong>Controle Financeiro</strong>
    </div>
    <nav class="menu">${links}</nav>`;

  document.getElementById("topbar").innerHTML = `
    <button class="menu-mobile" onclick="document.getElementById('sidebar').classList.toggle('aberta')">☰</button>
    <span class="titulo">${tituloPagina}</span>
    <span class="espaco"></span>
    <span id="usuario-email" style="font-size:13px;color:var(--cinza-texto)"></span>
    <button class="btn btn-cinza btn-mini" onclick="sair()">Sair</button>`;
}

/* ---------- Acesso ao banco ---------- */
async function listar(tabela, opcoes) {
  const o = opcoes || {};
  let q = db.from(tabela).select(o.select || "*");
  if (o.filtros) {
    for (const f of o.filtros) q = q[f[0]](f[1], f[2]);
  }
  q = q.order(o.ordem || "created_at", { ascending: o.asc === true });
  const { data, error } = await q;
  if (error) {
    toast(error.message, "erro");
    return [];
  }
  return data || [];
}

async function salvar(tabela, registro, id) {
  const user = await usuarioAtual();
  if (!user) return false;
  let error;
  if (id) {
    ({ error } = await db.from(tabela).update(registro).eq("id", id));
  } else {
    ({ error } = await db.from(tabela).insert({ ...registro, user_id: user.id }));
  }
  if (error) {
    toast(error.message, "erro");
    return false;
  }
  toast(id ? "Registro atualizado!" : "Registro criado!", "ok");
  return true;
}

async function excluir(tabela, id) {
  if (!confirm("Deseja realmente excluir este registro?")) return false;
  const { error } = await db.from(tabela).delete().eq("id", id);
  if (error) {
    toast(error.message, "erro");
    return false;
  }
  toast("Registro excluído.", "ok");
  return true;
}

/* ---------- Modal ---------- */
function abrirModal(id) { document.getElementById(id).classList.add("aberto"); }
function fecharModal(id) { document.getElementById(id).classList.remove("aberto"); }
