import Sidebar from "@/components/Sidebar";
import RiskTable from "@/components/RiskTable";
import StatCard from "@/components/StatCard";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ReturnGuardPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />

      <section className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-950">
            ReturnGuard AI
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Detect risky orders before shipping and suggest smart verification actions.
          </p>
        </header>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Analyzed Orders" value="150" subtitle="Total uploaded" tone="blue" />
            <StatCard title="High Risk" value="18" subtitle="Manual verification" tone="red" />
            <StatCard title="Medium Risk" value="45" subtitle="Need confirmation" tone="purple" />
            <StatCard title="Safe Orders" value="87" subtitle="Ready to ship" tone="green" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="text-blue-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Explainable AI</h2>
              <p className="mt-2 text-sm text-slate-500">
                Every risk score includes clear reason tags like COD, unverified phone,
                high amount, or long distance.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AlertTriangle className="text-red-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Verify First</h2>
              <p className="mt-2 text-sm text-slate-500">
                The system does not cancel orders. It recommends low-friction
                verification before shipping.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <CheckCircle2 className="text-green-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Action Suggestion</h2>
              <p className="mt-2 text-sm text-slate-500">
                Ship normally, send confirmation, verify address, call, or ask
                partial advance based on risk level.
              </p>
            </div>
          </div>

          <RiskTable />
        </div>
      </section>
    </main>
  );
}