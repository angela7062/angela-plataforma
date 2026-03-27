const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hmkuczuoqlawheywrvyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta3VjenVvcWxhd2hleXdydnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjQxNjcsImV4cCI6MjA4OTQ0MDE2N30.9Ds6KTdw1P85BspklolY3GL_dZutgdZSxa6bQeib3Ts';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceSignup() {
  console.log('Tentando cadastrar novo usuário de admin...');
  
  // Vamos usar um novo email para garantir que não há conflito de conta já existente mas não confirmada
  const newEmail = 'admin@imovelforte.com.br';
  const newPassword = 'adminpassword123';
  
  const { data, error } = await supabase.auth.signUp({
    email: newEmail,
    password: newPassword,
  });

  if (error) {
    console.error('Erro no cadastro:', error.message);
    return;
  }
  
  console.log('--- CADASTRO FEITO ---');
  console.log('Email para Login:', newEmail);
  console.log('Senha para Login:', newPassword);
  
  if (data.user?.identities?.length === 0) {
    console.log('\n⚠️ AVISO: A conta já existia ou este email precisa de confirmação.');
  } else {
    console.log('\n✅ NOVO USUÁRIO CRIADO TEMPORARIAMENTE!');
  }
}

forceSignup();
