import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase Administrativo exclusivo para uso no lado do servidor.
 * 
 * Este cliente utiliza a SUPABASE_SERVICE_ROLE_KEY, o que permite:
 * 1. Ignorar as políticas de RLS (Row Level Security).
 * 2. Realizar operações administrativas sobre tabelas restritas.
 * 3. Gerenciar usuários sem as limitações do cliente comum de navegador.
 * 
 * AVISO: Nunca utilize este arquivo em componentes com "use client" ou envie esta 
 * chave service_role para o navegador (ela deve permanecer estritamente no servidor).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificações de segurança para garantir que as variáveis de ambiente foram carregadas
if (!supabaseUrl) {
  throw new Error('ERRO: A variável NEXT_PUBLIC_SUPABASE_URL não está definida no arquivo .env.local');
}

if (!supabaseServiceRoleKey) {
  throw new Error('ERRO: A variável SUPABASE_SERVICE_ROLE_KEY não está definida no arquivo .env.local (ou você está tentando usar este arquivo no lado do cliente)');
}

/**
 * Instância única (Singleton) do cliente administrativo
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
