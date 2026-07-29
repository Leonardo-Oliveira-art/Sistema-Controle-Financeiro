/*
 * CONFIGURAÇÃO DO SUPABASE
 * ------------------------------------------------------------
 * Troque os dois valores abaixo pelos do SEU projeto Supabase:
 *   Painel Supabase > Project Settings > API
 *     - Project URL          -> SUPABASE_URL
 *     - anon / publishable   -> SUPABASE_KEY  (pode ficar público, é protegida por RLS)
 * ------------------------------------------------------------
 */
const SUPABASE_URL = "https://qidkdahzbmrxnmrnrdxp.supabase.com";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndnZycGJzcHBhbXB1cGV1Z3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzgxNzQsImV4cCI6MjEwMDkxNDE3NH0.X-TwE5zoXqdG31wFZKbuDj-9qrhjPK7ImxjafnCoY3g";

// Cliente global usado por todas as páginas
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
