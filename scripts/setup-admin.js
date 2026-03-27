const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hmkuczuoqlawheywrvyq.supabase.co';
// Necessitamos da KEY para criar usuários bypassando signup regular
// Por enquanto vamos tentar usar a anon key, mas normalmente precisa da service_role key.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta3VjenVvcWxhd2hleXdydnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjQxNjcsImV4cCI6MjA4OTQ0MDE2N30.9Ds6KTdw1P85BspklolY3GL_dZutgdZSxa6bQeib3Ts';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestAdmin() {
  console.log('Tentando criar usuário via script...');
  
  const { data, error } = await supabase.auth.signUp({
    email: 'mfreitas_86@hotmail.com',
    password: '123456',
  });

  if (error) {
    console.error('Erro ao criar usuário:', error.message);
    return;
  }
  
  console.log('Usuário criado com sucesso:', data.user?.email);
  console.log('Agora você pode fazer login em /admin/login');
}

createTestAdmin();
