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

  // Mapeamento de siglas para nomes completos de estados
  const stateNames: Record<string, string> = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
    'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
    'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
    'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
    'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
  };

  const stateFull = stateNames[state?.toUpperCase()] || state;

  // Função auxiliar para capitalizar strings (Title Case)
  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const street_name = toTitleCase(formData.get('street_name') as string);
  const street_number = toTitleCase(formData.get('street_number') as string);
  const condo_name = toTitleCase(formData.get('condo_name') as string);

  const gallery = [];
  for (let i = 1; i <= 21; i++) {
    const photoUrl = formData.get(`photo_${i}`) as string;
    if (photoUrl && photoUrl.trim() !== '') {
      gallery.push(photoUrl.trim());
    }
  }

  const logradouro_tipo = formData.get('logradouro_tipo') as string;
  const siglas: Record<string, string> = {
    'Alameda': 'AL',
    'Avenida': 'AV',
    'Balneário': 'BAL',
    'Estrada': 'EST',
    'Fazenda': 'FAZ',
    'Ladeira': 'LAD',
    'Loteamento': 'LOT',
    'Rodovia': 'ROD',
    'Rua': 'R',
    'Travessa': 'TV',
    'Viela': 'VLA'
  };
  const logradouro_sigla = siglas[logradouro_tipo] || null;

  const features = {
    // Seção 1: Localização detalhada
    street_name,
    street_number,
    condo_name,

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
    logradouro_tipo,
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

    // Seção 6: Segurança
    seguranca_features: {
      alarme: formData.get('seg_alarme') === 'true',
      cerca_eletrica: formData.get('seg_cerca_eletrica') === 'true',
      camera: formData.get('seg_camera') === 'true',
      portao_automatico: formData.get('seg_portao_automatico') === 'true',
    },

    // Seção 5: Infraestrutura do Condomínio
    condo_features: {
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
      portaria_24h: formData.get('condo_portaria_24h') === 'true',
    },

    // Seção 7: Informações Restritas (Uso Interno)
    announcer_name: formData.get('announcer_name') as string,
    announcer_whatsapp: formData.get('announcer_whatsapp') as string,
    announcer_type: formData.get('announcer_type') as string,
    announcer_email: formData.get('announcer_email') as string,
    announcer_creci: formData.get('announcer_creci') as string,
    announcer_company: formData.get('announcer_company') as string,
    announcer_photo: formData.get('announcer_photo') as string,
    intent: formData.get('intent') as string,
  };

  const logradouro = logradouro_tipo;

  return { title, description, price, city, state, stateFull, gallery, features, logradouro, logradouro_sigla, street_name, street_number, condo_name };
}


export async function createProperty(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { title, description, price, city, state, stateFull, gallery, features, logradouro, logradouro_sigla, street_name, street_number, condo_name } = extractPropertyData(formData);
  const intent = formData.get('intent') as string;
  const condition = formData.get('condition') as string;
  const category = formData.get('category') as string;
  const subcategory = formData.get('subcategory') as string;
  
  const slug = (title || 'imovel').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  
  const dataToInsert = {
    title,
    slug,
    description,
    price,
    address_city: city,
    address_state: state,
    address_state_full: stateFull,
    intent,
    condition,
    category,
    subcategory,
    features,
    gallery,
    logradouro,
    logradouro_sigla,
    street_name,
    street_number,
    condo_name,
    main_image: gallery.length > 0 ? gallery[0] : null,
    status: 'ativo',
    ...(user ? { seller_id: user.id } : {}),
  };

  const { error } = await supabase.from('properties').insert(dataToInsert);
  if (error) {
    console.error('Error creating property:', error);
    return { error: `Erro ao salvar Imóvel: ${error.message} (Código: ${error.code})` };
  }

  // Upsert profile data if logged in (não bloqueia se falhar - RLS pode impedir)
  if (user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: features.announcer_name,
      // whatsapp: features.announcer_whatsapp, // whatsapp column might not exist in profiles based on schema.sql, but was used in code. I'll keep it as is if it was working.
      avatar_url: features.announcer_photo,
    });

    if (profileError) {
      // Log apenas - o imóvel já foi salvo com sucesso
      console.warn('Aviso: Perfil não atualizado (RLS?):', profileError.message);
    }
    
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  }

  return redirect('/obrigado-pelo-anuncio');
}

export async function updateProperty(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      return redirect('/login');
    }
  
    const id = formData.get('id') as string;
    const { title, description, price, city, state, stateFull, gallery, features, logradouro, logradouro_sigla, street_name, street_number, condo_name } = extractPropertyData(formData);
    const intent = formData.get('intent') as string;
    const condition = formData.get('condition') as string;
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
  
    const { error } = await supabase
      .from('properties')
      .update({
        title,
        description,
        price,
        address_city: city,
        address_state: state,
        address_state_full: stateFull,
        intent,
        condition,
        category,
        subcategory,
        features,
        gallery,
        logradouro,
        logradouro_sigla,
        street_name,
        street_number,
        condo_name,
        main_image: gallery.length > 0 ? gallery[0] : null,
      })
      .eq('id', id);
  
    if (error) {
      console.error('Error updating property:', error);
      return { error: `Erro ao atualizar Imóvel: ${error.message} (Código: ${error.code})` };
    }

    // Upsert profile data (não bloqueia se falhar - RLS pode impedir)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: features.announcer_name,
      // whatsapp: features.announcer_whatsapp,
      avatar_url: features.announcer_photo,
    });

    if (profileError) {
      // Log apenas - o imóvel já foi atualizado com sucesso
      console.warn('Aviso: Perfil não atualizado (RLS?):', profileError.message);
    }
  
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
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
      .eq('id', id);
  
    if (error) {
      console.error(error);
      return redirect(`/admin/editar/${id}?error=Erro ao deletar imóvel`);
    }
  
    revalidatePath('/admin');
    revalidatePath('/');
    return redirect('/admin');
}

export async function updatePropertyStatus(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return redirect('/login');
    }

    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    const allowedStatus = new Set(['Ativo', 'Inativo', 'Vendido', 'Alugado']);

    if (!id || !allowedStatus.has(status)) {
      return { error: 'Dados inválidos para atualização de status.' };
    }

    const { error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .eq('seller_id', user.id);

    if (error) {
      console.error('Error updating property status:', error);
      return { error: `Erro ao atualizar status: ${error.message} (Código: ${error.code})` };
    }

    revalidatePath('/admin');
    revalidatePath('/imoveis');
    revalidatePath('/');
    return { success: true };
}
