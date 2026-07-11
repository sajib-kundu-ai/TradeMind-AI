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
    <main className="tm-dark-app pb-24 lg:pb-0">
      <Sidebar />
      <section className="tm-app-content lg:pl-64">
        <header className="tm-app-header px-6 py-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ReturnGuard AI</h1>
              <p className="mt-1 text-sm text-slate-400">Detect risky orders before shipping and suggest smart verification actions.</p>
            </div>
            <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">{dataSource}</span>
          </div>
        </header>
        <div className="space-y-6 p-6">
          {error && <p className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-5 text-sm text-rose-200">Could not load risk analysis: {error}</p>}
          {notice && <p className="rounded-2xl border border-emerald-200 bg-emerald-500/10 p-5 text-sm font-medium text-emerald-200">{notice}</p>}
          {!data && (
            <div className="rounded-2xl border border-white/10 tm-glass p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
              <ShieldCheck className="mx-auto text-cyan-300" size={32} />
              <h2 className="mt-4 text-xl font-bold text-white">No risk data yet</h2>
              <p className="mt-2 text-sm text-slate-400">Upload orders to generate risk analysis.</p>
              <Link href="/upload" className="mt-5 inline-flex rounded-2xl tm-button-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                Upload Orders
              </Link>
            </div>
          )}
          {data && (
            <>
          {legacyAnalysis && (
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-5 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-6 shadow-sm"><AlertTriangle className="text-rose-300" size={28} /><h2 className="mt-4 font-bold text-white">Verification Queue</h2><p className="mt-2 text-sm text-slate-400">{verificationQueue} high or medium risk orders should be confirmed before shipping.</p><div className="mt-4 rounded-2xl bg-white/[0.07] p-4 text-sm font-semibold text-rose-200">Prioritize phone/address confirmation for high-value COD orders.</div></div>
            <div className="grid gap-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-sm"><ShieldCheck className="text-cyan-300" size={28} /><h2 className="mt-4 font-bold text-white">Explainable AI</h2><p className="mt-2 text-sm text-slate-400">Every risk score includes clear reason tags such as COD, unverified phone, high amount, or long distance.</p></div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-sm"><CheckCircle2 className="text-emerald-300" size={28} /><h2 className="mt-4 font-bold text-white">Action Suggestions</h2><p className="mt-2 text-sm text-slate-400">Each order receives a practical action based on its calculated risk level.</p></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleReanalyze} disabled={reanalyzing} className="inline-flex items-center gap-2 rounded-2xl tm-button-primary px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
              <BrainCircuit size={17} /> {reanalyzing ? "Re-analyzing..." : "Re-analyze with latest AI"}
            </button>
            <Link href="/predict" className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20">
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
