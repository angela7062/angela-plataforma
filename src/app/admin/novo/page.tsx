import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'

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

  return <PropertyForm />
}
