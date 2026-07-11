import Sidebar from "@/components/Sidebar";
import DashboardCommandCenter from "@/components/DashboardCommandCenter";
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <main className="tm-dark-app pb-24 lg:pb-0">
      <Sidebar />

      <section className="tm-app-content lg:pl-64">
        <header className="tm-app-header px-6 py-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Command Center</h1>
              <p className="mt-1 text-sm text-slate-400">
                Interactive control room for ReturnGuard, ProfitDoctor and StockMind.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/upload"
                className="w-fit rounded-2xl tm-button-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Analyze New Orders
              </Link>
              <Link
                href="/predict?mode=chat"
                className="w-fit rounded-2xl border border-cyan-300/20 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
              >
                Chat Predict
              </Link>
            </div>
          </div>
        </header>

        <DashboardCommandCenter />
      </section>
    </main>
  );
}
