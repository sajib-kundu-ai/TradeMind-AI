import Sidebar from "@/components/Sidebar";
import { FileDown, LockKeyhole, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";

const reports = [
  { title: "Risk Report", description: "Order risk scores, reason tags, and recommended verification actions.", icon: ShieldCheck, tone: "from-blue-500 to-cyan-400", status: "Coming soon" },
  { title: "Profit Report", description: "Revenue, cost, net margin, and product-level profitability summary.", icon: TrendingUp, tone: "from-emerald-500 to-teal-400", status: "Coming soon" },
  { title: "Stock Report", description: "Inventory health, stock-out forecasts, and restock recommendations.", icon: PackageCheck, tone: "from-violet-500 to-fuchsia-400", status: "Coming soon" },
];

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />
      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">Reports</h1><p className="mt-1 text-sm text-slate-500">Export polished business intelligence summaries for your team.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700"><LockKeyhole size={14} /> Secure exports</span></div>
        </header>

        <div className="space-y-7 p-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d1d] p-7 text-white shadow-2xl sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
            <div className="relative max-w-2xl"><span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">Report center</span><h2 className="mt-4 text-3xl font-bold tracking-tight">Turn analysis into shareable insight.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Report downloads are being prepared. Your live risk, profit, and stock intelligence remains available throughout the dashboard.</p></div>
          </div>

          <div><div className="mb-4"><h2 className="text-lg font-bold text-slate-950">Available report types</h2><p className="mt-1 text-sm text-slate-500">Each report will use the latest analyzed seller dataset.</p></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{reports.map(({ title, description, icon: Icon, tone, status }) => <article key={title} className="group overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}><Icon size={23} /></div><h3 className="mt-6 text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p><button type="button" disabled className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"><FileDown size={17} />{status}</button></article>)}</div></div>
        </div>
      </section>
    </main>
  );
}
