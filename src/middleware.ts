import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Atualiza a sessão do usuário em todas as requisições.
  const response = await updateSession(request)

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isNewAdPath = request.nextUrl.pathname === '/admin/novo';

  // Se a rota for /admin/novo, o acesso é público (não fazemos nada).
  if (isNewAdPath) {
    return response;
  }

  // Se a rota for qualquer outra dentro de /admin/*, verificamos a autenticação.
  if (isAdminPath && !isNewAdPath) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // é tratado pela função updateSession
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Se não houver usuário logado, redireciona para a página de login.
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Para todas as outras rotas, continua normalmente.
  return response
}

export const config = {
  matcher: [
    /*
     * Faz o match de todas as rotas, exceto arquivos estáticos, imagens e o favicon.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
