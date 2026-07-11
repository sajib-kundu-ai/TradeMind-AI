import Sidebar from "@/components/Sidebar";
import ReportsClient from "@/components/ReportsClient";
import { LockKeyhole } from "lucide-react";

export default async function ReportsPage() {
  return (
    <main className="tm-dark-app pb-24 lg:pb-0">
      <Sidebar />
      <section className="tm-app-content lg:pl-64">
        <header className="tm-app-header px-6 py-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
              <p className="mt-1 text-sm text-slate-400">Export polished business intelligence summaries for your team.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <LockKeyhole size={14} /> Secure exports
            </span>
          </div>
        </header>

        <ReportsClient />
      </section>
    </main>
  );
}
