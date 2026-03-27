import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md luxury-card p-10 rounded-xl relative">
        <h1 className="text-[#CBA153] font-serif text-3xl mb-8 tracking-tighter">Acesso Admin</h1>
        <form className="flex flex-col gap-6 w-full text-left">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-xs tracking-widest uppercase" htmlFor="email">
              Email
            </label>
            <input
              className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-3 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors"
              id="email"
              name="email"
              type="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-xs tracking-widest uppercase" htmlFor="password">
              Senha
            </label>
            <input
              className="bg-[#121212] border border-[#CBA153]/30 rounded-sm px-4 py-3 text-[#E0E0E0] focus:border-[#CBA153] focus:outline-none transition-colors"
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <button formAction={login} className="btn-luxury w-full">
              Entrar
            </button>
            <button formAction={signup} className="text-gray-500 text-xs uppercase tracking-widest hover:text-[#CBA153] transition-colors">
              Ou criar conta
            </button>
          </div>
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-black/50 text-[#CBA153] text-center text-sm border border-[#CBA153]/20 rounded-sm">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
