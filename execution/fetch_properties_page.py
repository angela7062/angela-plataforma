#!/usr/bin/env python3
"""
Camada de execução: valida a mesma query usada na home (Supabase REST).
- status = cadastrado
- main_image preenchido (não nulo e não vazio)
- ordenação created_at desc
- janela de 60 linhas (página 1: offset 0, limit 60)

Uso (na raiz do repositório):
  pip install -r execution/requirements.txt
  python execution/fetch_properties_page.py

Requer .env ou .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.

A tabela oficial é `public.properties` (colunas normalizadas incl. status, quartos, area_util, etc.).
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Instale dependências: pip install -r execution/requirements.txt", file=sys.stderr)
    raise

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None  # type: ignore


ROOT = Path(__file__).resolve().parent.parent


def load_env() -> None:
    if load_dotenv is None:
        print("Instale python-dotenv ou exporte as variáveis manualmente.", file=sys.stderr)
        return
    load_dotenv(ROOT / ".env.local")
    load_dotenv(ROOT / ".env")


def main() -> int:
    load_env()
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()
    if not url or not key:
        print("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.", file=sys.stderr)
        return 1

    page_size = 60
    page = 1
    api = f"{url.rstrip('/')}/rest/v1/properties"
    # Parâmetros alinhados a src/app/page.tsx (status, imagem, ordem, range)
    params = {
        "select": "*",
        "status": "eq.cadastrado",
        "main_image": "not.is.null",
        "order": "created_at.desc",
        "offset": (page - 1) * page_size,
        "limit": page_size,
    }
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Prefer": "count=exact",
    }

    r = requests.get(api, headers=headers, params=params, timeout=30)
    if r.status_code != 200:
        print(f"Erro HTTP {r.status_code}: {r.text[:500]}", file=sys.stderr)
        return 1

    rows = r.json()
    if not isinstance(rows, list):
        print("Resposta inesperada (não é lista).", file=sys.stderr)
        return 1

    cr = r.headers.get("content-range", "")
    # Formato típico: 0-59/123
    print(f"Content-Range: {cr}")
    print(f"Linhas neste lote: {len(rows)} (esperado até {page_size})")

    bad = [
        i
        for i, row in enumerate(rows)
        if not row.get("main_image")
        or str(row.get("status", "")).lower() != "cadastrado"
    ]
    if bad:
        print(f"Aviso: {len(bad)} linhas falham validação local de main_image/status.", file=sys.stderr)
        return 1

    sample = [
        {"id": row.get("id"), "slug": row.get("slug"), "title": (row.get("title") or "")[:48]}
        for row in rows[:3]
    ]
    print("Amostra (até 3):", json.dumps(sample, ensure_ascii=True, indent=2))
    print("Query de validação OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
