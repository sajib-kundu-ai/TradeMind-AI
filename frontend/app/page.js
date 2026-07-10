import Link from "next/link";
import { ArrowUpRight, Upload } from "lucide-react";

const navItems = ["ReturnGuard", "ProfitDoctor", "StockMind", "Reports"];

const stats = [
  ["150+", "Orders analyzed"],
  ["18", "High-risk orders"],
  ["৳3.2k", "Expected loss"],
];

const riskCards = [
  ["Low Risk", "87", "text-emerald-300", "from-emerald-400/20"],
  ["Medium Risk", "45", "text-amber-300", "from-amber-400/20"],
  ["High Risk", "18", "text-rose-300", "from-rose-400/20"],
];

const orders = [
  ["ORD-1024", "Headphone", "High", "Call first"],
  ["ORD-1031", "Cosmetics", "Medium", "Confirm"],
  ["ORD-1042", "T-Shirt", "Low", "Ship"],
];

function riskColor(risk) {
  if (risk === "High") return "text-rose-300";
  if (risk === "Medium") return "text-amber-300";
  return "text-emerald-300";
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050711] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute right-[-160px] top-28 h-[480px] w-[480px] rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-150px] h-[460px] w-[460px] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.14),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0),rgba(5,7,17,0.94)_72%)]" />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 font-bold text-white shadow-lg shadow-cyan-500/25">
            T
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight">
              TradeMind AI
            </span>
            <span className="block truncate text-xs font-medium text-slate-400">
              by Lossless Labs
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-cyan-300/10 bg-white/[0.06] p-1 text-sm text-slate-300 shadow-lg shadow-blue-950/20 backdrop-blur md:flex">
          {navItems.map((item) => (
            <span
              key={item}
              className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
            >
              {item}
            </span>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 backdrop-blur transition hover:border-cyan-300/40 hover:bg-white/[0.14] sm:px-5"
        >
          Launch App
          <ArrowUpRight size={16} />
        </Link>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8">
        <div>
          <div className="mb-5 inline-flex max-w-full rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur">
            <span className="truncate">
              AI Business Copilot for Small Online Sellers
            </span>
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Turn seller data
            <br />
            into{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              smart
            </span>
            <br />
            business
            <br />
            decisions.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Detect risky orders before shipping, reduce failed delivery loss,
            analyze profit, monitor stock, and generate business reports using
            explainable AI.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-500/35 focus:outline-none focus:ring-4 focus:ring-cyan-300/25"
            >
              Open Dashboard
              <ArrowUpRight size={17} />
            </Link>
            <Link
              href="/upload"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-white/[0.07] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/20 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.12] focus:outline-none focus:ring-4 focus:ring-cyan-300/20"
            >
              <Upload size={17} />
              Upload Orders
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-lg shadow-blue-950/20 backdrop-blur"
              >
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/25 blur-2xl" />

          <div className="relative rounded-[2rem] border border-cyan-300/15 bg-white/[0.08] p-3 shadow-2xl shadow-blue-950/50 backdrop-blur-xl sm:p-5">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#090d1f]/90 p-4 sm:p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    ReturnGuard AI
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Order risk analysis
                  </p>
                </div>
                <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  Live Demo
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {riskCards.map(([label, value, color, glow]) => (
                  <div
                    key={label}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-br ${glow} to-white/[0.04] p-4 shadow-lg shadow-blue-950/20`}
                  >
                    <p className="text-xs font-semibold text-slate-400">
                      {label}
                    </p>
                    <p className={`mt-2 text-3xl font-bold ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {orders.map(([order, product, risk, action]) => (
                  <div
                    key={order}
                    className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm shadow-sm sm:grid-cols-4 sm:items-center"
                  >
                    <span className="font-semibold text-white">{order}</span>
                    <span className="min-w-0 truncate text-slate-300">
                      {product}
                    </span>
                    <span className={`font-semibold ${riskColor(risk)}`}>
                      {risk}
                    </span>
                    <span className="text-left font-medium text-slate-400 sm:text-right">
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-7 left-4 rounded-3xl border border-cyan-300/15 bg-slate-950/70 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:-left-6 sm:p-5">
            <p className="text-sm font-medium text-slate-300">
              Business Health
            </p>
            <p className="mt-2 text-3xl font-bold text-white">74/100</p>
          </div>
        </div>
      </section>
    </main>
  );
}
