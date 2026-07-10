"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RiskTable from "@/components/RiskTable";
import StatCard from "@/components/StatCard";
import DonutChart from "@/components/DonutChart";
import { loadPreferredAnalysis, readStoredAnalysis } from "@/lib/analysisSource";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ReturnGuardPage() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return null;
    return readStoredAnalysis();
  });
  const [dataSource, setDataSource] = useState(() => (data ? "Uploaded analysis" : "Loading data"));
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(async () => {
      setError("");
      try {
        const preferred = await loadPreferredAnalysis(100);
        setData(preferred.data);
        setDataSource(preferred.source);
      } catch (requestError) {
        setError(requestError.message);
        setDataSource("Unavailable");
      }
    });
  }, []);

  const summary = data?.risk_summary || {};
  const verificationQueue = Number(summary.high_risk || 0) + Number(summary.medium_risk || 0);
  const riskSegments = [
    { label: "Low Risk", value: summary.low_risk, color: "#22c55e" },
    { label: "Medium Risk", value: summary.medium_risk, color: "#f59e0b" },
    { label: "High Risk", value: summary.high_risk, color: "#ef4444" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />
      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">ReturnGuard AI</h1>
              <p className="mt-1 text-sm text-slate-500">Detect risky orders before shipping and suggest smart verification actions.</p>
            </div>
            <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{dataSource}</span>
          </div>
        </header>
        <div className="space-y-6 p-6">
          {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load risk analysis: {error}</p>}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Analyzed Orders" value={summary.total_orders || 0} subtitle={dataSource} tone="blue" />
            <StatCard title="High Risk" value={summary.high_risk || 0} subtitle="Manual verification" tone="red" />
            <StatCard title="Medium Risk" value={summary.medium_risk || 0} subtitle="Need confirmation" tone="purple" />
            <StatCard title="Safe Orders" value={summary.low_risk || 0} subtitle="Ready to ship" tone="green" />
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <DonutChart
              title="Risk Distribution"
              subtitle="Low, medium and high risk order mix"
              segments={riskSegments}
              centerLabel="Orders"
              centerValue={Number(summary.total_orders || 0).toLocaleString()}
            />
            <div className="rounded-3xl border border-red-100 bg-red-50/70 p-6 shadow-sm"><AlertTriangle className="text-red-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Verification Queue</h2><p className="mt-2 text-sm text-slate-500">{verificationQueue} high or medium risk orders should be confirmed before shipping.</p><div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm font-semibold text-red-700">Prioritize phone/address confirmation for high-value COD orders.</div></div>
            <div className="grid gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><ShieldCheck className="text-blue-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Explainable AI</h2><p className="mt-2 text-sm text-slate-500">Every risk score includes clear reason tags such as COD, unverified phone, high amount, or long distance.</p></div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><CheckCircle2 className="text-green-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Action Suggestions</h2><p className="mt-2 text-sm text-slate-500">Each order receives a practical action based on its calculated risk level.</p></div>
            </div>
          </div>
          <RiskTable orders={data?.risk_orders || []} />
        </div>
      </section>
    </main>
  );
}
