# Execução (Camada 3)

Scripts Python determinísticos para APIs, processamento de dados, ficheiros e bases de dados. Variáveis de ambiente e tokens vivem em `.env` na raiz do repositório.

Dependências Python: `pip install -r requirements.txt` (criar ou atualizar este ficheiro quando adicionar pacotes).

- `fetch_properties_page.py` — valida no Supabase (REST) o lote de 60 imóveis com `status=cadastrado` e `main_image` preenchido, alinhado a `src/app/page.tsx`.

**Nota:** utilitários em JavaScript ligados à app Next.js permanecem em [`../scripts/`](../scripts/), não nesta pasta.
