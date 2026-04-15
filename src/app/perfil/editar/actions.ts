'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type Database, type UserCategory } from '@/types/database';

// Schema de validação alinhado com a nova estrutura unificada
const ProfileRpcSchema = z.object({
  full_name: z.string().min(3, { message: "O nome completo precisa ter pelo menos 3 caracteres." }),
  whatsapp: z.string(),
  p_category: z.enum([
    'Vendedor Particular',
    'Corretor',
    'Prestador de Serviço de Manutenção',
    'Engenheiro',
    'Arquiteto',
    'Construtor',
    'Quero Comprar',
    'Quero Alugar',
    ''
  ]),
  p_company_name: z.string().optional(),
  p_professional_license: z.string().optional(), // Campo unificado
});

export async function updateUserProfileRpcAction(formData: unknown) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            getAll: () => cookieStore.getAll(),
            set: (name, value, options) => cookieStore.set({ name, value, ...options }),
            remove: (name, options) => cookieStore.delete({ name, ...options }),
        },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Acesso não autorizado. Faça login novamente." };
  }

  const result = ProfileRpcSchema.safeParse(formData);
  if (!result.success) {
    const errorMessages = result.error.issues.map((e) => e.message).join('\n');
    return { success: false, message: `Dados inválidos: ${errorMessages}` };
  }

  // Desestruturando os dados validados com a nomenclatura correta
  const { full_name, whatsapp, p_category, p_company_name, p_professional_license } = result.data;

  try {
    // Chamando a função RPC atualizada com os parâmetros corretos
    const { error: rpcError } = await supabase.rpc('update_user_profile', {
      p_full_name: full_name,
      p_whatsapp: whatsapp,
      p_category: p_category as UserCategory,
      p_company_name: p_company_name,
      p_professional_license: p_professional_license,
    });

    if (rpcError) {
      throw new Error(`Erro no banco de dados: ${rpcError.message}`);
    }

    revalidatePath('/perfil/editar');
    revalidatePath('/');

    return { success: true, message: "Perfil atualizado com sucesso!" };

  } catch (e: any) {
    return { success: false, message: e.message || "Ocorreu um erro inesperado." };
  }
}
