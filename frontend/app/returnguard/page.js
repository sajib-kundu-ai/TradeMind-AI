"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RiskTable from "@/components/RiskTable";
import StatCard from "@/components/StatCard";
import DonutChart from "@/components/DonutChart";
import { loadPreferredAnalysis, readStoredAnalysis, saveStoredAnalysis } from "@/lib/analysisSource";
import { reanalyzeLatestAnalysis } from "@/lib/api";
import { AlertTriangle, BrainCircuit, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ReturnGuardPage() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return null;
    return readStoredAnalysis();
  });
  const [dataSource, setDataSource] = useState(() => (data ? "Uploaded analysis" : "No analysis yet"));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reanalyzing, setReanalyzing] = useState(false);

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
  const orders = data?.risk_orders || [];
  const verificationQueue = Number(summary.high_risk || 0) + Number(summary.medium_risk || 0);
  const fallbackCount = orders.filter((order) => !order.ml_available).length;
  const legacyAnalysis = orders.length > 0 && fallbackCount >= Math.max(1, Math.ceil(orders.length * 0.8));
  const riskSegments = [
    { label: "Low Risk", value: summary.low_risk, color: "#22c55e" },
    { label: "Medium Risk", value: summary.medium_risk, color: "#f59e0b" },
    { label: "High Risk", value: summary.high_risk, color: "#ef4444" },
  ];

  async function handleReanalyze() {
    const token = window.localStorage.getItem("trademind_token");
    if (!token) {
      setError("Sign in to re-analyze saved analysis with the latest AI model.");
      return;
    }

    setReanalyzing(true);
    setError("");
    setNotice("");
    try {
      const response = await reanalyzeLatestAnalysis(token);
      setData(response.analysis);
      setDataSource("Latest saved analysis");
      saveStoredAnalysis(response.analysis);
      setNotice("Analysis refreshed with latest ML model.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setReanalyzing(false);
    }
  }

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
          {notice && <p className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium text-emerald-700">{notice}</p>}
          {!data && (
            <div className="rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
              <ShieldCheck className="mx-auto text-blue-600" size={32} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No risk data yet</h2>
              <p className="mt-2 text-sm text-slate-500">Upload orders to generate risk analysis.</p>
              <Link href="/upload" className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Upload Orders
              </Link>
            </div>
          )}
          {data && (
            <>
          {legacyAnalysis && (
            <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2"><AlertTriangle size={17} /> This analysis was created before the ML model update. Re-analyze to add ML confidence.</span>
              <button type="button" onClick={handleReanalyze} disabled={reanalyzing} className="w-fit rounded-2xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:cursor-wait disabled:opacity-60">
                {reanalyzing ? "Re-analyzing..." : "Re-analyze with latest AI"}
              </button>
            </div>
          )}
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
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleReanalyze} disabled={reanalyzing} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
              <BrainCircuit size={17} /> {reanalyzing ? "Re-analyzing..." : "Re-analyze with latest AI"}
            </button>
            <Link href="/predict" className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
              <Search size={17} /> Check Single Order
            </Link>
          </div>
          <RiskTable orders={orders} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
