"use client"

export default function AnimatedGlassCard() {
  return (
    <div className="relative w-full max-w-xl rounded-3xl p-[1px] 
                    bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-sky-500/30
                    shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
      {/* fundo “vidro” */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0B1220]/70 backdrop-blur-xl">
        {/* blob de gradiente que se move */}
        <div
          className="pointer-events-none absolute -inset-10 rounded-full blur-3xl motion-ok"
          style={{
            background:
              "radial-gradient(40% 60% at 30% 30%, rgba(88,101,242,0.45) 0%, rgba(0,0,0,0) 60%), radial-gradient(45% 70% at 70% 60%, rgba(168,85,247,0.35) 0%, rgba(0,0,0,0) 60%)",
            animation: "gradient-pan 10s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* conteúdo do card */}
        <div className="relative z-10 p-8 text-slate-200">
          {/* anéis à esquerda */}
          <div className="relative h-20 w-20">
            <span className="absolute inset-0 rounded-full border border-white/10" />
            <span className="absolute inset-3 rounded-full border border-white/10" />
            <span
              className="absolute inset-6 rounded-full border border-white/20 motion-ok"
              style={{ animation: "orbit 6s ease-in-out infinite" }}
            />
          </div>

          {/* linhas “placeholder” */}
          <div className="mt-10 space-y-3 opacity-70">
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-1/3 rounded bg-white/10" />
          </div>

          {/* botão com brilho passando */}
          <button
            className="relative mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3
                       bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500
                       text-white/95 font-medium shadow-lg shadow-indigo-900/20 motion-ok"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            Interagir
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
            >
              <span
                className="absolute inset-y-0 -left-1/3 w-1/3 rotate-12 bg-white/30"
                style={{ filter: "blur(8px)", animation: "shimmer 1.8s linear infinite" }}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
