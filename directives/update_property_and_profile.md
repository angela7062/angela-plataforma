
# Diretiva: Atualização Atômica de Imóvel e Perfil do Anunciante

**ID:** `update_property_and_profile`

**Versão:** 1.0

## 1. Objetivo

Esta diretiva governa a atualização de informações de um anúncio de imóvel e do perfil do seu respectivo anunciante. A operação deve ser **atômica**, garantindo que as duas entidades (`properties` e `profiles`) sejam atualizadas simultaneamente ou nenhuma delas, prevenindo inconsistência de dados.

## 2. Camada de Execução

A lógica de execução para esta diretiva é implementada por:

-   **Server Action:** `src/app/admin/editar/[id]/actions.ts` -> `updatePropertyAndProfile`
-   **Função RPC (Database):** `supabase/migrations/20260407_update_property_and_profile.sql` -> `update_property_and_profile()`

## 3. Entradas Requeridas

A Server Action `updatePropertyAndProfile` espera os seguintes argumentos:

1.  `propertyId` (string): O UUID do imóvel a ser atualizado.
2.  `sellerId` (string): O UUID do anunciante (chave estrangeira `seller_id` em `properties` e `id` em `profiles`).
3.  `formData` (FormData): Um objeto FormData contendo os dados do formulário, que deve ser compatível com os schemas Zod definidos.

## 4. Lógica de Negócio e Validação

-   **Validação de Schema:** Antes de qualquer operação de banco de dados, os dados de entrada (`formData`) são validados contra um schema Zod (`FormSchema`) que combina as regras de `PropertySchema` e `ProfileSchema`.
-   **Transação Atômica:** A atualização no banco de dados é encapsulada em uma única função de stored procedure (`update_property_and_profile`). Esta função utiliza uma transação implícita do PostgreSQL (`BEGIN`/`COMMIT`/`ROLLBACK` via `EXCEPTION` block) para garantir que as atualizações nas tabelas `public.properties` e `public.profiles` sejam executadas como uma única unidade atômica.

## 5. Estrutura de Retorno (Self-Annealing)

O retorno da Server Action é um objeto JSON estruturado para permitir diagnóstico e auto-correção pela camada de orquestração.

### Exemplo de Sucesso:

```json
{
  "success": true,
  "message": "Dados atualizados com sucesso!"
}
```

### Exemplo de Erro:

```json
{
  "success": false,
  "error_type": "VALIDATION" | "DATABASE" | "AUTH" | "UNKNOWN",
  "message": "Descrição legível do erro.",
  "technical_details": { ... } // Detalhes técnicos como códigos de erro, campos inválidos, etc.
}
```

-   `error_type`: Classifica a fonte do erro, permitindo à orquestração tomar decisões informadas.
-   `technical_details`: Fornece o contexto bruto do erro para depuração e correção automatizada.

## 6. Casos de Borda e Erros Comuns

-   **Falha de Validação:** Ocorre se os dados do `formData` não atenderem aos requisitos do `FormSchema`. A orquestração deve analisar `technical_details` para identificar os campos problemáticos.
-   **Violação de Constraint do BD (ex: slug duplicado):** A camada de banco de dados retornará um erro (`error_type: 'DATABASE'`). A orquestração pode usar essa informação para, por exemplo, sugerir um novo `slug` ao usuário.
-   **Falha de Autenticação/Autorização:** Se o usuário não tiver permissão para executar a operação, um erro do tipo `AUTH` será retornado.
