-- 1. Auditoria e Atualização da tabela public.profiles para Agentes e Profissionais
-- Adiciona colunas para categorização profissional

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_professional boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_category text,
ADD COLUMN IF NOT EXISTS service_type text;

-- 2. Configuração de Constraints de Validação (CHECK)
-- Garante que os dados inseridos correspondam exatamente ao menu do site

-- Remover constraints antigas para recriar se necessário
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_service_category_check;

-- Adicionar constraint para service_category
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_service_category_check 
CHECK (service_category IN ('Vendas', 'Projetos', 'Construção', 'Manutenção'));

-- 3. Lógica de Validação de service_type via Trigger
-- Como service_type depende da service_category, usaremos uma função de validação

CREATE OR REPLACE FUNCTION public.validate_profile_service_type()
RETURNS trigger AS $$
BEGIN
  -- Se não for profissional, as categorias de serviço podem ser nulas
  IF NEW.is_professional = false THEN
    RETURN NEW;
  END IF;

  -- Validação das categorias e tipos
  IF NEW.service_category = 'Vendas' AND NEW.service_type NOT IN ('Corretores de Imóveis', 'Imobiliárias Cadastradas', 'Agências') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Vendas: %', NEW.service_type;
  ELSIF NEW.service_category = 'Projetos' AND NEW.service_type NOT IN ('Arquitetos', 'Engenheiros') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Projetos: %', NEW.service_type;
  ELSIF NEW.service_category = 'Construção' AND NEW.service_type NOT IN ('Construtores') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Construção: %', NEW.service_type;
  ELSIF NEW.service_category = 'Manutenção' AND NEW.service_type NOT IN ('Pedreiros', 'Pintores', 'Encanadores', 'Eletricistas', 'Todos') THEN
    RAISE EXCEPTION 'Tipo de serviço inválido para Manutenção: %', NEW.service_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_service_type ON public.profiles;
CREATE TRIGGER trigger_validate_service_type
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.validate_profile_service_type();

-- 4. Comentários para documentação no banco de dados
COMMENT ON COLUMN public.profiles.is_professional IS 'Flag para identificar se o usuário é um prestador de serviço profissional';
COMMENT ON COLUMN public.profiles.service_category IS 'Categoria profissional conforme menu Agentes/Profissionais';
COMMENT ON COLUMN public.profiles.service_type IS 'Tipo específico de serviço vinculado à categoria principal';
