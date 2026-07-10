import Sidebar from "@/components/Sidebar";
import ReportsClient from "@/components/ReportsClient";
import { getDemoAnalysis } from "@/lib/api";
import { LockKeyhole } from "lucide-react";

async function loadReportsData() {
  try {
    return await getDemoAnalysis(100);
  } catch {
    return null;
  }
}

export default async function ReportsPage() {
  const data = await loadReportsData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />
      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Reports</h1>
              <p className="mt-1 text-sm text-slate-500">Export polished business intelligence summaries for your team.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <LockKeyhole size={14} /> Secure exports
            </span>
          </div>
        </header>

        <ReportsClient initialData={data} />
      </section>
    </main>
  );
}
