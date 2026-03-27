const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://hmkuczuoqlawheywrvyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta3VjenVvcWxhd2hleXdydnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjQxNjcsImV4cCI6MjA4OTQ0MDE2N30.9Ds6KTdw1P85BspklolY3GL_dZutgdZSxa6bQeib3Ts';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogin() {
  console.log('Tentando fazer login real com a conta...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mfreitas_86@hotmail.com',
    password: '123456',
  });

  if (error) {
    console.error('Erro no login real:', error.message);
    if (error.message.includes('Email not confirmed')) {
      console.log('A conta precisa de confirmação de email no painel do Supabase!');
    }
    return;
  }
  
  console.log('LOGIN BEM SUCEDIDO!');
  console.log('Usuário Logado:', data.user?.email);
}

checkLogin();
