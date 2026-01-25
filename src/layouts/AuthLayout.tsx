import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-900 opacity-90 z-10" />
        {/* Abstract shapes */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg max-h-lg border border-white/10 rounded-full animate-spin-slow duration-[30s]" />

        <div className="relative z-20 text-white max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">
              P
            </div>
            <span className="text-2xl font-bold tracking-tight">Plano</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6 leading-tight">
            Planejamento estratégico simplificado para equipes modernas.
          </h1>
          <p className="text-lg text-indigo-100 leading-relaxed">
            Organize metas, acompanhe o progresso e colabore com seu time em uma
            única plataforma projetada para o crescimento.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-4">
              <img
                src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3"
                className="w-10 h-10 rounded-full border-2 border-primary"
                alt="User"
              />
              <img
                src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4"
                className="w-10 h-10 rounded-full border-2 border-primary"
                alt="User"
              />
              <img
                src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5"
                className="w-10 h-10 rounded-full border-2 border-primary"
                alt="User"
              />
            </div>
            <p className="text-sm font-medium text-indigo-100">
              Junte-se a mais de 10.000 líderes.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Content */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[400px] animate-fade-in-up">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
