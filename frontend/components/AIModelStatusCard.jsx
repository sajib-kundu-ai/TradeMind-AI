"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { getModelMetrics } from "@/lib/api";

function percent(value) {
  if (value === null || value === undefined) return "--";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function cleanFeatureName(value) {
  return String(value || "")
    .replace("numeric__", "")
    .replace("categorical__", "")
    .replaceAll("_", " ");
}

export default function AIModelStatusCard({ compact = false, metrics: providedMetrics }) {
  const [fetchedMetrics, setFetchedMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (providedMetrics) return;

    let active = true;
    getModelMetrics()
      .then((data) => {
        if (active) setFetchedMetrics(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [providedMetrics]);

  const metrics = providedMetrics || fetchedMetrics;

  const topSignal = useMemo(() => {
    const feature = metrics?.top_features?.[0]?.feature;
    return feature ? cleanFeatureName(feature) : "account age days";
  }, [metrics]);

  const active = Boolean(metrics?.ml_available);

  return (
    <section className={`rounded-2xl border border-white/10 tm-glass shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl ${compact ? "p-5" : "p-6"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">AI Model Status</p>
          <h2 className="mt-2 text-lg font-bold text-white">Model: {active ? "RandomForest" : "Rule Engine"}</h2>
        </div>
        <span className="rounded-2xl bg-blue-500/10 p-2 text-cyan-300">
          {active ? <BrainCircuit size={20} /> : <ShieldCheck size={20} />}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-500/10 text-amber-200"}`}>
          {active ? "Active" : "Fallback"}
        </span>
        <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-300">scikit-learn</span>
      </div>

      {active ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3">
              <p className="text-xs font-semibold text-blue-200">Accuracy</p>
              <p className="mt-1 text-lg font-bold text-blue-100">{percent(metrics.accuracy)}</p>
            </div>
            <div className="rounded-2xl bg-violet-500/10 p-3">
              <p className="text-xs font-semibold text-violet-200">F1 Score</p>
              <p className="mt-1 text-lg font-bold text-violet-100">{percent(metrics.f1)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
            <span className="rounded-full bg-white/[0.08] px-3 py-1">Training Rows: {Number(metrics.training_rows || 0).toLocaleString()}</span>
            <span className="rounded-full bg-white/[0.08] px-3 py-1">Top signal: {topSignal}</span>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-100">Rule engine fallback active</p>
          <p className="mt-1 text-sm text-amber-200">{metrics?.message || error || "Train ML model to enable confidence scoring"}</p>
        </div>
      )}
    </section>
  );
}
