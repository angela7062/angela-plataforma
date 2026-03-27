import VirtualCard from '@/components/card/VirtualCard';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles(full_name, phone)
    `)
    .eq('slug', params.slug)
    .single();

  if (error || !property) {
    notFound();
  }

  const propertyData = {
    title: property.title,
    subtitle: `${property.address_city} • ${property.address_state}`,
    price: property.price || 0,
    description: property.description || '',
    city: property.address_city || '',
    state: property.address_state || '',
    specs: property.specs as any,
    seller_name: (property.profiles as any)?.full_name || 'Anunciante',
    seller_phone: (property.profiles as any)?.phone || '',
    main_image: property.main_image || undefined,
  };

  return <VirtualCard property={propertyData} slug={params.slug} />;
}
