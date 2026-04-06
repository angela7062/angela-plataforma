-- PARTE 1 — BANCO DE DADOS (executar no SQL Editor do Supabase)

-- 1) Criar coluna consolidada de busca:
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS search_text tsvector;

-- 2) Popular a coluna unificando os campos de endereço e título:
UPDATE public.properties SET search_text =
to_tsvector('portuguese',
  coalesce(title,'') || ' ' ||
  coalesce(street_name,'') || ' ' ||
  coalesce(logradouro,'') || ' ' ||
  coalesce(logradouro_sigla,'') || ' ' ||
  coalesce(address_state_full,'') || ' ' ||
  coalesce(address_state,'') || ' ' ||
  coalesce(address_city,'') || ' ' ||
  coalesce(street_number,'') || ' ' ||
  coalesce(condo_name,'') || ' ' ||
  coalesce(category,'') || ' ' ||
  coalesce(subcategory,'')
);

-- 3) Criar índice GIN para performance:
CREATE INDEX IF NOT EXISTS idx_search_properties
ON public.properties USING GIN(search_text);

-- PARTE 2 — MANTER A COLUNA ATUALIZADA AUTOMATICAMENTE

-- Criar trigger para atualizar o search_text sempre que o registro mudar:
CREATE OR REPLACE FUNCTION properties_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_text :=
  to_tsvector('portuguese',
    coalesce(NEW.title,'') || ' ' ||
    coalesce(NEW.street_name,'') || ' ' ||
    coalesce(NEW.logradouro,'') || ' ' ||
    coalesce(NEW.logradouro_sigla,'') || ' ' ||
    coalesce(NEW.address_state_full,'') || ' ' ||
    coalesce(NEW.address_state,'') || ' ' ||
    coalesce(NEW.address_city,'') || ' ' ||
    coalesce(NEW.street_number,'') || ' ' ||
    coalesce(NEW.condo_name,'') || ' ' ||
    coalesce(NEW.category,'') || ' ' ||
    coalesce(NEW.subcategory,'')
  );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_properties_search_update ON public.properties;

CREATE TRIGGER trg_properties_search_update
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION properties_search_update();
