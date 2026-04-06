# Front-end — listagem pública (`/`)

## Grid

- A rota `/` usa **grade de 3 colunas** em viewports grandes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Espaçamento: `gap-6 lg:gap-8`; largura máxima do conteúdo `max-w-[1400px]`.
- Cards reutilizam o padrão visual **luxury** (`luxury-card` em `globals.css`), alinhado ao painel Admin.

## Paginação

- **60 anúncios por página** (constante `PAGE_SIZE` em `src/app/page.tsx`).
- Índices: página 1 usa `range(0, 59)` no Supabase; página N usa `start = (N-1)*60`, `end = start + 59`.
- Controlo no rodapé do `<main>`: componente `HomePagination` — setas discretas e texto `atual / total`, sem substituir a rolagem vertical da página.

## Dados (Supabase)

- Tabela única: **`public.properties`** (não usar `imoveis`).
- Listar **apenas** imóveis com `status = 'cadastrado'`.
- Excluir linhas sem imagem principal: `main_image` não nulo e não string vazia.
- Colunas numéricas de apresentação: `quartos`, `banheiros`, `vagas`, `area_util`, `area_total` — o UI prioriza estas colunas e recai no JSON `specs` quando necessário (`mergePropertySpecs` em detalhe; `PropertyCard` na listagem).
- Não renderizar cards sem dados reais (sem placeholder de imagem na listagem; `PropertyCard` retorna `null` se não houver `main_image`).
- Páginas públicas de detalhe `/imovel/[slug]` e `/cartao/[slug]` devem exigir o mesmo `status` para consistência.

## Busca (`/imoveis`)

- Mesma grelha de 3 colunas e paginação de 60 itens que a home.
- Filtros via query string: `estado` (UF), `cidade` (ilike em `address_city`), `bairro` (ilike em `title` ou `description`), mais `intent` / `status` do formulário preservados na URL para evolução futura.

## Validação (Camada de Execução)

- Script `execution/fetch_properties_page.py` — confirma a query REST equivalente (lote de 60, filtros e ordenação `created_at` desc).

## Migração

- Se a coluna `status` ainda não existir em `properties`, aplicar `migrations/add_property_status.sql` no Supabase.
