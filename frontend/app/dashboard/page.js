import Sidebar from "@/components/Sidebar";
import DashboardCommandCenter from "@/components/DashboardCommandCenter";
import { getDemoAnalysis } from "@/lib/api";
import Link from "next/link";

async function loadDashboardData() {
  try {
    return await getDemoAnalysis(100);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await loadDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />

      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">AI Command Center</h1>
              <p className="mt-1 text-sm text-slate-500">
                Interactive control room for ReturnGuard, ProfitDoctor and StockMind.
              </p>
            </div>

            <Link
              href="/upload"
              className="w-fit rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Analyze New Orders
            </Link>
          </div>
        </header>

        <DashboardCommandCenter initialData={data} />
      </section>
    </main>
  );
}
