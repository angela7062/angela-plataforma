import PropertyPage, { type PropertyData } from '@/components/landing/PropertyPage';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { mergePropertySpecs } from '@/lib/merge-property-specs';

export default async function Page({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Busca o imóvel pelo slug, e faz um join com profiles para pegar o nome e telefone do vendedor
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles(full_name, phone)
    `)
    .eq('slug', params.slug)
    .in('status', ['Ativo', 'cadastrado'])
    .single();

  if (error || !property) {
    notFound();
  }

  // Mapeia os dados do banco para o formato esperado pelo componente
  const propertyData = {
    title: property.title,
    subtitle: `${property.address_city} • ${property.address_state}`,
    price: property.price || 0,
    description: property.description || '',
    city: property.address_city || '',
    state: property.address_state || '',
    specs: mergePropertySpecs(property) as PropertyData['specs'],
    seller_name: (property.profiles as { full_name?: string | null })?.full_name || 'Anunciante',
    seller_phone: (property.profiles as { phone?: string | null })?.phone || '',
    main_image: property.main_image || undefined,
  };

  return <PropertyPage property={propertyData} />;
}
