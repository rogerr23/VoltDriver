import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#07110f] px-6 py-12 text-white">
      <section className="w-full max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-lime-400">
          VoltDriver
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Seu trabalho elétrico, com resultado claro.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          A base do MVP está pronta. As jornadas, recargas e metas serão
          adicionadas nas próximas etapas.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/entrar"
            className="flex min-h-12 items-center justify-center rounded-xl bg-lime-400 px-5 font-bold text-slate-950 transition hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 font-semibold text-white transition hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Criar conta
          </Link>
        </div>
        <Link
          href="/veiculo"
          className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-lime-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
        >
          Configurar meu veículo →
        </Link>
      </section>
    </main>
  );
}
