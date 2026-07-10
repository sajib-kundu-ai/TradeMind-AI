import Link from "next/link";
import {
  BarChart3,
  BrainCircuit,
  PackageCheck,
  ShieldCheck,
  Upload,
  WalletCards,
} from "lucide-react";

const features = [
  {
    name: "ReturnGuard AI",
    description: "Flag risky orders before shipping and reduce failed delivery loss.",
    icon: ShieldCheck,
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    name: "ProfitDoctor",
    description: "Track margin, fees, delivery cost, and profit leaks in one place.",
    icon: WalletCards,
    accent: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    name: "StockMind",
    description: "Spot low stock, slow movers, and items that need quick attention.",
    icon: PackageCheck,
    accent: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  {
    name: "AI Predict",
    description: "Ask questions about orders and get practical next-step guidance.",
    icon: BrainCircuit,
    accent: "bg-amber-50 text-amber-700 ring-amber-100",
  },
];

const metrics = [
  ["Orders analyzed", "150+"],
  ["High-risk orders", "18"],
  ["Expected loss", "৳3.2k"],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_46%,#eff6ff_100%)] text-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 font-bold text-white shadow-lg shadow-blue-200">
            T
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight">
              TradeMind AI
            </span>
            <span className="block truncate text-xs font-medium text-slate-500">
              by Lossless Labs
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Login
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:pb-20">
        <div>
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <BarChart3 size={16} />
            <span className="truncate">AI business copilot for online sellers</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            TradeMind AI
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Turn order, profit, stock, and customer signals into clear decisions
            your team can act on before losses stack up.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            >
              Open Dashboard
            </Link>
            <Link
              href="/upload"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Upload size={17} />
              Upload Orders
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              Login
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {metrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/70 sm:p-5">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Demo workspace
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Seller intelligence overview
                </h2>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                Ready
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Low Risk", "87", "text-emerald-700"],
                ["Medium Risk", "45", "text-amber-700"],
                ["High Risk", "18", "text-red-700"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["ORD-1024", "Headphone", "High", "Call first"],
                ["ORD-1031", "Cosmetics", "Medium", "Confirm"],
                ["ORD-1042", "T-Shirt", "Low", "Ship"],
              ].map(([order, product, risk, action]) => (
                <div
                  key={order}
                  className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm shadow-sm sm:grid-cols-4 sm:items-center"
                >
                  <span className="font-semibold text-slate-950">{order}</span>
                  <span className="min-w-0 truncate text-slate-600">{product}</span>
                  <span className="font-semibold text-slate-700">{risk}</span>
                  <span className="text-left font-medium text-slate-500 sm:text-right">
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${feature.accent}`}
                >
                  <Icon size={21} />
                </span>
                <h3 className="text-base font-bold text-slate-950">
                  {feature.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
