'use server'

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

const PROFILE_KEYS = [ "full_name", "phone", "user_role", "is_professional", "service_category", "service_type"];

const FormValidationSchema = z.object({
  title: z.string().min(5, "O título é obrigatório."),
  price: z.preprocess((val) => parseFloat(String(val)), z.number().positive("O preço é obrigatório.")),
  full_name: z.string().min(3, "O nome do proprietário é obrigatório.").optional(),
});

// A função agora aceita apenas o propertyId e o formData
export async function updatePropertyAndProfile(propertyId: string, formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const rawFormData = Object.fromEntries(formData.entries());

  const validation = FormValidationSchema.safeParse(rawFormData);
  if (!validation.success) {
    return { success: false, error_type: "VALIDATION", message: "Dados inválidos.", technical_details: validation.error.flatten().fieldErrors };
  }

  // --- Lógica de Reconstrução da Estrutura Aninhada (idêntica à da criação) ---
  const profileData = {};
  const propertyMainData = {};
  const specsData = { condo_specs: {}, seguranca_specs: {}, admin_features: [] };
  const otherSpecs = {};

  for (const [key, value] of Object.entries(rawFormData)) {
    if (value === '' || value === null) continue; 
    const boolVal = value === 'true' ? true : value === 'false' ? false : value;
    if (PROFILE_KEYS.includes(key)) {
      profileData[key] = boolVal;
    } else if (key.startsWith('condo_')) {
      specsData.condo_specs[key.replace('condo_', '')] = boolVal;
    } else if (key.startsWith('seg_')) {
      specsData.seguranca_specs[key.replace('seg_', '')] = boolVal;
    } else {
      const mainPropertyFields = ['id', 'title', 'description', 'price', 'intent', 'condition', 'category', 'subcategory', 'address_city', 'address_state', 'main_image', 'gallery', 'is_luxury', 'purpose'];
      if (mainPropertyFields.includes(key)) {
        propertyMainData[key] = boolVal;
      } else {
        otherSpecs[key] = boolVal;
      }
    }
  }
  
  Object.assign(specsData, otherSpecs);
  // --- Fim da Lógica de Reconstrução ---

  const rpcParams = {
    p_property_id: propertyId, // Passa o ID da propriedade a ser atualizada
    p_profile_data: profileData, // Objeto com os dados do perfil
    p_property_data: { ...propertyMainData, specs: specsData }, // Objeto com os dados do imóvel e specs aninhados
  };
  
  try {
    const { error } = await supabase.rpc("update_property_and_profile", rpcParams);
    if (error) {
      console.error("Erro RPC:", error);
      throw error;
    }

    revalidatePath(`/admin/editar/${propertyId}`);
    return { success: true, message: "Imóvel atualizado com sucesso!" };

  } catch (error: any) {
    return { success: false, error_type: "DATABASE", message: error.message, technical_details: { code: error.code, details: error.details } };
  }
}
