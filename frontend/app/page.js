import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070816] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold shadow-lg shadow-blue-500/20">
            T
          </div>
          <div>
            <h1 className="font-bold">TradeMind AI</h1>
            <p className="text-xs text-slate-400">by Lossless Labs</p>
          </div>
        </div>

        <div className="hidden items-center gap-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 backdrop-blur md:flex">
          <span>ReturnGuard</span>
          <span>ProfitDoctor</span>
          <span>StockMind</span>
          <span>Reports</span>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Login
        </Link>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
            AI Business Copilot for Small Online Sellers
          </div>

          <h2 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Turn seller data into{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              smart business decisions.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Detect risky orders before shipping, reduce failed delivery loss,
            analyze profit, monitor stock, and generate business reports using
            explainable AI.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-1 hover:from-blue-500 hover:to-violet-500"
            >
              Open Dashboard
            </Link>

            <Link
              href="/upload"
              className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
            >
              Upload Orders
            </Link>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-bold">150+</p>
              <p className="mt-1 text-xs text-slate-400">Orders analyzed</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-bold">18</p>
              <p className="mt-1 text-xs text-slate-400">High-risk orders</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-2xl font-bold">৳3.2k</p>
              <p className="mt-1 text-xs text-slate-400">Expected loss</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl" />

          <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#0d1024] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">ReturnGuard AI</h3>
                  <p className="text-sm text-slate-400">Order risk analysis</p>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                  Live Demo
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Low Risk</p>
                  <p className="mt-2 text-3xl font-bold text-green-300">87</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Medium Risk</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-300">45</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">High Risk</p>
                  <p className="mt-2 text-3xl font-bold text-red-300">18</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["ORD-1024", "Headphone", "High", "Call before shipping"],
                  ["ORD-1031", "Cosmetics", "Medium", "Send confirmation"],
                  ["ORD-1042", "T-Shirt", "Low", "Ship normally"],
                ].map((row) => (
                  <div
                    key={row[0]}
                    className="grid grid-cols-4 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm"
                  >
                    <span className="font-medium">{row[0]}</span>
                    <span className="text-slate-300">{row[1]}</span>
                    <span
                      className={
                        row[2] === "High"
                          ? "text-red-300"
                          : row[2] === "Medium"
                          ? "text-yellow-300"
                          : "text-green-300"
                      }
                    >
                      {row[2]}
                    </span>
                    <span className="text-right text-slate-400">{row[3]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-8 hidden rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur md:block">
            <p className="text-sm text-slate-300">Business Health</p>
            <p className="mt-2 text-3xl font-bold">74/100</p>
          </div>
        </div>
      </section>
    </main>
  );
}
