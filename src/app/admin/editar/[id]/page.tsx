import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) {
    redirect('/admin')
  }

  return <PropertyForm property={property} />
}
