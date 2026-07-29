/*
 * CONFIGURAÇÃO DO SUPABASE
 * ------------------------------------------------------------
 * Troque os dois valores abaixo pelos do SEU projeto Supabase:
 *   Painel Supabase > Project Settings > API
 *     - Project URL          -> SUPABASE_URL
 *     - anon / publishable   -> SUPABASE_KEY  (pode ficar público, é protegida por RLS)
 * ------------------------------------------------------------
 */
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_KEY = "SUA-CHAVE-ANON-PUBLICA";

// Cliente global usado por todas as páginas
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
