'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function extractPropertyData(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string) || 0;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;

  const gallery = [];
  for (let i = 1; i <= 15; i++) {
    const photoUrl = formData.get(`photo_${i}`) as string;
    if (photoUrl && photoUrl.trim() !== '') {
      gallery.push(photoUrl.trim());
    }
  }

  const specs = {
    // Seção 2: Estrutura e Dimensões
    tipo_imovel: formData.get('tipo_imovel') as string,
    area_m2: parseFloat(formData.get('area_m2') as string) || 0,
    area_terreno: parseFloat(formData.get('area_terreno') as string) || 0,
    tempo_construcao_anos: parseInt(formData.get('tempo_construcao_anos') as string) || 0,
    dormitorios: parseInt(formData.get('dormitorios') as string) || 0,
    suites: parseInt(formData.get('suites') as string) || 0,
    banheiros: parseInt(formData.get('banheiros') as string) || 0,
    vagas: parseInt(formData.get('vagas') as string) || 0,
    tipo_vaga: formData.get('tipo_vaga') as string,
    condominio_ou_rua: formData.get('condominio_ou_rua') as string,
    dependencia_empregada: formData.get('dependencia_empregada') === 'true',
    tipo_bairro: formData.get('tipo_bairro') as string,
    distancia_praia: parseInt(formData.get('distancia_praia') as string) || 0,
    distancia_comercio: parseInt(formData.get('distancia_comercio') as string) || 0,
    tem_area_gourmet: formData.get('tem_area_gourmet') === 'true',
    tem_varanda: formData.get('tem_varanda') === 'true',
    tem_sacada: formData.get('tem_sacada') === 'true',
    tem_portao_automatico: formData.get('tem_portao_automatico') === 'true',

    // Seção 3: Condição e Documentação
    casa_nova: formData.get('casa_nova') === 'true',
    reformada: formData.get('reformada') === 'true',
    conservacao: formData.get('conservacao') as string,
    mobiliada: formData.get('mobiliada') as string,
    documentacao: formData.get('documentacao') as string,

    // Seção 4: Lazer & Comodidades
    tem_piscina: formData.get('tem_piscina') === 'true',
    tem_edicula: formData.get('tem_edicula') === 'true',
    tem_churrasqueira: formData.get('tem_churrasqueira') === 'true',
    tem_hidro: formData.get('tem_hidro') === 'true',
    tem_ar: formData.get('tem_ar') === 'true',

    // Seção 5: Infraestrutura do Condomínio
    condo_specs: {
      piscina: formData.get('condo_piscina') === 'true',
      churrasqueira: formData.get('condo_churrasqueira') === 'true',
      salao_festas: formData.get('condo_salao_festas') === 'true',
      academia: formData.get('condo_academia') === 'true',
      playground: formData.get('condo_playground') === 'true',
      quadra: formData.get('condo_quadra') === 'true',
      brinquedoteca: formData.get('condo_brinquedoteca') === 'true',
      jogos: formData.get('condo_jogos') === 'true',
      gourmet: formData.get('condo_gourmet') === 'true',
      sauna: formData.get('condo_sauna') === 'true',
      pet_place: formData.get('condo_pet_place') === 'true',
      caminhada: formData.get('condo_caminhada') === 'true',
      coworking: formData.get('condo_coworking') === 'true',
      bicicletario: formData.get('condo_bicicletario') === 'true',
      mercado: formData.get('condo_mercado') === 'true',
    },

    // Seção 7: Informações Restritas
    announcer_name: formData.get('announcer_name') as string,
    announcer_whatsapp: formData.get('announcer_whatsapp') as string,
    announcer_type: formData.get('announcer_type') as string,
    announcer_email: formData.get('announcer_email') as string,
    announcer_address_type: formData.get('announcer_address_type') as string,
    announcer_address_street: formData.get('announcer_address_street') as string,
    announcer_address_number: formData.get('announcer_address_number') as string,
    announcer_address_block: formData.get('announcer_address_block') as string,
    announcer_address_apt: formData.get('announcer_address_apt') as string,
    announcer_address_neighborhood: formData.get('announcer_address_neighborhood') as string,
    announcer_address_city: formData.get('announcer_address_city') as string,
    announcer_address_state: formData.get('announcer_address_state') as string,
    announcer_address_cep: formData.get('announcer_address_cep') as string,
  };

  return { title, description, price, city, state, gallery, specs };
}

export async function createProperty(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { title, description, price, city, state, gallery, specs } = extractPropertyData(formData);
  const slug = (title || 'imovel').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  
  const commonData = {
      title, slug, description, price, address_city: city, address_state: state,
      specs, gallery, main_image: gallery.length > 0 ? gallery[0] : null,
  };

  const dataToInsert = user 
      ? { ...commonData, seller_id: user.id, is_luxury: true, is_published: true }
      : { ...commonData, is_luxury: false, is_published: false };

  const { error } = await supabase.from('properties').insert(dataToInsert);

  if (error) {
      console.error('Error creating property:', error);
      return redirect(`/admin/novo?error=Erro ao salvar. Verifique os campos.`);
  }

  if (user) {
      revalidatePath('/admin');
      revalidatePath('/');
      return redirect('/admin');
  } else {
      return redirect('/obrigado-pelo-anuncio');
  }
}

export async function updateProperty(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return redirect('/login');
    }
  
    const id = formData.get('id') as string;
    const { title, description, price, city, state, gallery, specs } = extractPropertyData(formData);
  
    const { error } = await supabase
      .from('properties')
      .update({
        title,
        description,
        price,
        address_city: city,
        address_state: state,
        specs,
        gallery,
        main_image: gallery.length > 0 ? gallery[0] : null
      })
      .eq('id', id)
      .eq('seller_id', user.id);
  
    if (error) {
      console.error('Error updating property:', error);
      return redirect(`/admin/editar/${id}?error=Erro ao atualizar imóvel`);
    }
  
    revalidatePath('/admin');
    revalidatePath('/');
    return redirect('/admin');
}
  
export async function deleteProperty(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return redirect('/login');
    }
  
    const id = formData.get('id') as string;
  
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('seller_id', user.id);
  
    if (error) {
      console.error(error);
      return redirect(`/admin/editar/${id}?error=Erro ao deletar imóvel`);
    }
  
    revalidatePath('/admin');
    revalidatePath('/');
    return redirect('/admin');
}
