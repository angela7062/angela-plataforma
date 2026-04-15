import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PropertyForm from '@/components/admin/PropertyForm'
import { type Profile } from '@/types/database'

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

  // Fetch the profile data, which the form also needs.
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!property) {
    redirect('/admin')
  }

  // CORRECTED: Pass the `user` and `profile` objects to the form component.
  return <PropertyForm property={property} user={user} profile={profile} />
}
