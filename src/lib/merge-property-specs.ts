import type { Json } from '@/types/database'

type SpecsRecord = Record<string, unknown>

/**
 * Combina colunas normalizadas em `properties` com o JSON legado `features`
 * para os componentes de detalhe que ainda leem dormitorios, area_m2, etc.
 */
export function mergePropertySpecs(property: {
  features: Json | null
  quartos?: number | null
  banheiros?: number | null
  vagas?: number | null
  area_util?: number | null
  area_total?: number | null
}): SpecsRecord {
  const raw = property.features
  const base: SpecsRecord =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...(raw as SpecsRecord) }
      : {}

  return {
    ...base,
    dormitorios: property.quartos ?? (base.dormitorios as number | undefined),
    banheiros: property.banheiros ?? (base.banheiros as number | undefined),
    vagas: property.vagas ?? (base.vagas as number | undefined),
    area_m2: property.area_util ?? (base.area_m2 as number | undefined),
    area_terreno: property.area_total ?? (base.area_terreno as number | undefined),
  }
}
