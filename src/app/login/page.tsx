'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Loader2, MailCheck } from 'lucide-react';

// Componente para feedback visual (erro/sucesso)
function FormStatus({ type, message }: { type: 'error' | 'success', message: string }) {
    const baseClasses = "p-4 mt-4 text-sm rounded-md";
    const typeClasses = type === 'error' 
        ? "bg-red-900/50 text-red-300 border border-red-800"
        : "bg-green-900/50 text-green-300 border border-green-800";
    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Estados da UI
  const [view, setView] = useState<'LOGIN' | 'RECUPERAR_SENHA' | 'EMAIL_ENVIADO'>('LOGIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Lógica de Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus({ type: 'error', message: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    } else {
      // O onAuthStateChange no layout principal cuidará do redirecionamento
      router.push(searchParams?.get('redirect') || '/admin');
      router.refresh();
    }
    setIsSubmitting(false);
  };

  // Lógica de Recuperação de Senha
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/perfil/editar` // O usuário atualiza a senha e vai para o perfil
    });

    if (error) {
        // Não exibir o erro real para o usuário por segurança
        console.error('Password Reset Error:', error);
    }
    
    // Por segurança, sempre mostre uma mensagem de sucesso para não revelar quais e-mails estão cadastrados.
    setView('EMAIL_ENVIADO');
    setIsSubmitting(false);
  };

  // Lógica para o link de cadastro
  const getCadastroHref = () => {
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    return `/perfil/editar${queryString ? `?${queryString}` : ''}`;
  };

  const labelClass = "text-gray-400 text-[10px] tracking-widest uppercase";
  const inputClass = "bg-[#1C1C1C] border border-[#CBA153]/20 rounded-sm px-4 py-2.5 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors text-sm w-full";

  // Renderiza a view de LOGIN
  const renderLoginView = () => (
    <form onSubmit={handleLogin} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>Email</label>
        <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>Senha</label>
        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
      </div>
      <button type="button" onClick={() => setView('RECUPERAR_SENHA')} className="text-xs text-gray-500 hover:text-[#CBA153] text-right -mt-2">
        Esqueceu a senha? Clique aqui
      </button>
      <button type="submit" disabled={isSubmitting} className="bg-[#CBA153] text-[#121212] py-3 rounded-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Entrando...</> : 'Entrar'}
      </button>
    </form>
  );

  // Renderiza a view de RECUPERAÇÃO DE SENHA
  const renderResetPasswordView = () => (
    <form onSubmit={handlePasswordReset} className="flex flex-col gap-6">
        <p className='text-center text-gray-400 text-sm'>Digite o e-mail associado à sua conta para receber o link de recuperação.</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>Email</label>
        <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required placeholder='seu-email@dominio.com' />
      </div>
      <button type="submit" disabled={isSubmitting} className="bg-[#CBA153] text-[#121212] py-3 rounded-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Enviando...</> : 'Enviar Link de Recuperação'}
      </button>
      <button type="button" onClick={() => { setView('LOGIN'); setStatus(null); }} className="text-xs text-gray-500 hover:text-white text-center mt-2">
        Voltar para o Login
      </button>
    </form>
  );

  // Renderiza a view de EMAIL ENVIADO
  const renderEmailSentView = () => (
    <div className="flex flex-col items-center gap-6 text-center">
        <MailCheck size={48} className="text-green-400" />
        <h3 className='text-xl text-white font-semibold'>Verifique seu E-mail</h3>
        <p className='text-gray-400 text-sm'>Se o e-mail <span className='font-bold text-gray-300'>{email}</span> estiver cadastrado em nosso sistema, você receberá um link para redefinir sua senha em instantes.</p>
        <button type="button" onClick={() => { setView('LOGIN'); setEmail(''); setStatus(null); }} className="text-sm text-[#CBA153] hover:text-white font-bold mt-4">
            Voltar para o Login
        </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-4xl font-serif text-[#CBA153] text-center mb-4">Marketplace</h1>
        <p className="text-gray-500 text-center mb-8">Acesse sua conta para gerenciar seus imóveis.</p>

        <div className="luxury-card p-8 rounded-xl flex flex-col gap-6">
            {view === 'LOGIN' && renderLoginView()}
            {view === 'RECUPERAR_SENHA' && renderResetPasswordView()}
            {view === 'EMAIL_ENVIADO' && renderEmailSentView()}

            {status && <FormStatus type={status.type} message={status.message} />}
        </div>

        {view !== 'EMAIL_ENVIADO' && (
            <div className="text-center mt-8">
                <Link href={getCadastroHref()} className="text-sm text-gray-500 hover:text-white">
                    Não tem uma conta? <span className="font-bold text-[#CBA153] tracking-wider">CADASTRE-SE PARA ENTRAR</span>
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}
