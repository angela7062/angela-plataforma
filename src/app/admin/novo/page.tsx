import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'
import { type Profile } from '@/types/database'

// Força a validação a cada acesso, removendo o cache da página
export const revalidate = 0

export default async function NewPropertyPage() {
  const supabase = createClient()
  
  // No servidor, getUser() verifica a autenticidade da sessão via cookies
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirecionamento instantâneo via servidor antes de qualquer renderização
    redirect('/login?redirect=/admin/novo')
  }

  // Buscar o perfil do usuário para passar ao formulário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  // CORRECTED: Pass the `user` and `profile` objects to the form component.
  return <PropertyForm user={user} profile={profile} />
}
