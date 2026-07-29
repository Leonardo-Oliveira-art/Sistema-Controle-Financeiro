# Controle Financeiro Pessoal — HTML + CSS + JavaScript + Supabase

Sistema web 100% estático (sem build, sem Node). Pode ser hospedado direto no **GitHub Pages**.

## Estrutura

```
controle-financeiro/
├── index.html              # Login / Cadastro / Recuperar senha
├── redefinir-senha.html    # Nova senha (link do e-mail)
├── dashboard.html          # Cartões + gráficos + próximos vencimentos
├── receitas.html
├── despesas.html
├── contas-pagar.html
├── contas-pagas.html
├── categorias.html
├── css/
│   └── style.css           # Design branco/cinza/verde/azul + responsivo
├── js/
│   ├── config.js           # >>> COLOQUE AQUI A URL E A CHAVE DO SUPABASE <<<
│   ├── app.js              # Utilidades: sessão, layout, CRUD, toast, formatação
│   ├── dashboard.js
│   ├── lancamentos.js      # Receitas e Despesas
│   ├── contas.js           # Contas a pagar / pagas
│   └── categorias.js
└── database.sql            # Estrutura do banco (rodar no Supabase)
```

## Passo 1 — Criar o banco

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito.
2. Abra **SQL Editor** → **New query**.
3. Cole todo o conteúdo de `database.sql` e clique em **Run**.

Isso cria as tabelas (`profiles`, `categorias`, `receitas`, `despesas`, `contas_pagar`,
`metas`, `planejamentos`, `notificacoes`), as políticas de segurança (RLS por
`auth.uid()`) e o gatilho que cria o perfil + categorias padrão ao cadastrar um usuário.

## Passo 2 — Configurar as chaves

Em **Project Settings → API**, copie:

- **Project URL** → `SUPABASE_URL`
- **anon / publishable key** → `SUPABASE_KEY`

E cole em `js/config.js`. Essa chave é pública por natureza — os dados ficam
protegidos pelas políticas RLS.

## Passo 3 — Autenticação

Em **Authentication → Providers → Email**: mantenha ativo.
Para testar mais rápido, desative "Confirm email" (opcional).
Em **Authentication → URL Configuration**, adicione a URL do seu GitHub Pages
em *Site URL* e em *Redirect URLs*.

## Passo 4 — Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Sistema de controle financeiro"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

No repositório: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
O site fica em `https://SEU-USUARIO.github.io/SEU-REPO/`.

## Funcionalidades incluídas

- Login, cadastro, logout e recuperação de senha
- Dashboard com saldo, receitas, despesas, contas em aberto, gráfico de barras
  (6 meses) e rosca por categoria + próximos vencimentos
- Receitas e Despesas: cadastro, edição, exclusão, filtros por texto, categoria e período
- Contas a Pagar: prioridade, vencimento, marcar como paga, parcelas
- Contas Pagas: histórico e opção de reabrir
- Categorias: nome, tipo e cor personalizada
- Layout responsivo (desktop, tablet e celular)

## Bibliotecas usadas (via CDN, sem instalação)

- `@supabase/supabase-js@2` — banco de dados e autenticação
- `chart.js@4` — gráficos do dashboard
