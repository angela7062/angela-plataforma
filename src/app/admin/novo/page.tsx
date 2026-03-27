import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'

export default async function NewPropertyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <PropertyForm />
}
