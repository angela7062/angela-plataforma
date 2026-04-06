-- 1. Auditoria e Atualização da tabela public.properties
-- Adiciona colunas intent, category e subcategory se não existirem

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS intent text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS subcategory text;

-- 2. Configuração de Constraints de Validação (CHECK)
-- Garante que os dados inseridos correspondam exatamente ao menu do site

-- Remover constraints antigas para recriar com os novos valores
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_intent_check;
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_category_check;

-- Adicionar constraint para intent
ALTER TABLE public.properties 
ADD CONSTRAINT properties_intent_check 
CHECK (intent IN ('Vender', 'Alugar', 'Temporada'));

-- Adicionar constraint para category
ALTER TABLE public.properties 
ADD CONSTRAINT properties_category_check 
CHECK (category IN ('Casas', 'Apartamentos', 'Rurais & Lotes', 'Comercial', 'Lançamentos'));

-- 3. Lógica de Subcategorias via Trigger (Opcional, mas recomendado para consistência total)
-- Como subcategory depende da category, usaremos uma função de validação mais robusta

CREATE OR REPLACE FUNCTION public.validate_property_subcategory()
RETURNS trigger AS $$
BEGIN
  IF NEW.category = 'Casas' AND NEW.subcategory NOT IN ('CASA TÉRREA', 'TÉRREA GEMINADA', 'TÉRREA EM CONDOMÍNIO', 'SOBRADO', 'SOBRADO GEMINADO', 'SOBRADO EM CONDOMÍNIO', 'CASA SOBREPOSTA', 'SOBREPOSTA EM CONDOMÍNIO') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Casas: %', NEW.subcategory;
  ELSIF NEW.category = 'Apartamentos' AND UPPER(NEW.subcategory) NOT IN ('EM GERAL', 'KITNETS / FLATS / STUDIOS', 'COBERTURA DUPLEX', 'NA PLANTA') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Apartamentos: %', NEW.subcategory;
  ELSIF NEW.category = 'Rurais & Lotes' AND UPPER(NEW.subcategory) NOT IN ('SÍTIOS E CHÁCARAS', 'LOTES E TERRENOS', 'FAZENDAS') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Rurais & Lotes: %', NEW.subcategory;
  ELSIF NEW.category = 'Comercial' AND UPPER(NEW.subcategory) NOT IN ('SALAS COMERCIAIS', 'PRÉDIOS INTEIROS', 'GALPÕES', 'LOJAS') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Comercial: %', NEW.subcategory;
  ELSIF NEW.category = 'Lançamentos' AND UPPER(NEW.subcategory) NOT IN ('NA PLANTA', 'EM OBRAS', 'PRONTO PARA MORAR', 'OPORTUNIDADES') THEN
    RAISE EXCEPTION 'Subcategoria inválida para Lançamentos: %', NEW.subcategory;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_subcategory ON public.properties;
CREATE TRIGGER trigger_validate_subcategory
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE PROCEDURE public.validate_property_subcategory();

-- 4. Comentários para documentação no banco de dados
COMMENT ON COLUMN public.properties.intent IS 'Intenção do anúncio: Comprar, Alugar ou Temporada';
COMMENT ON COLUMN public.properties.category IS 'Categoria principal conforme menu COMPRAR';
COMMENT ON COLUMN public.properties.subcategory IS 'Subcategoria específica vinculada à categoria principal';
