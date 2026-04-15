
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import EditProfileForm from './EditProfileForm'; // O formulário do lado do cliente
import { type Database } from '@/types/database';

export default async function EditProfilePage() {
  const cookieStore = cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            set(name: string, value: string, options: CookieOptions) {
                cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                cookieStore.delete({ name, ...options });
            },
        },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?message=Faça login para editar seu perfil.');
  }

  // 1. Buscar apenas os dados que REALMENTE estão na tabela 'profiles'
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url') // <-- CORREÇÃO: Seleciona apenas colunas existentes.
    .eq('id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: ignora erro se o perfil ainda não existir
    console.error('Erro ao buscar perfil:', error);
  }

  // 2. Combinar dados da sessão (auth.users) com dados da tabela profiles
  const combinedProfile = {
    id: session.user.id,
    email: session.user.email ?? '', 
    phone: session.user.phone ?? '', // <-- CORREÇÃO: Telefone obtido de session.user (auth.users)
    full_name: profileData?.full_name ?? '',
    avatar_url: profileData?.avatar_url ?? null,
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col font-sans p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-[#CBA153] font-serif text-3xl tracking-tighter">Editar Perfil</h1>
            <p className="text-gray-400 text-sm">Atualize suas informações pessoais e de contato.</p>
        </div>
        {/* Passa o objeto combinado para o formulário. */}
        <EditProfileForm profile={combinedProfile as any} />
      </div>
    </div>
  );
}
