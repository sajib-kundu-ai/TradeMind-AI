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
    <section className={`rounded-3xl border border-white/70 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl ${compact ? "p-5" : "p-6"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AI Model Status</p>
          <h2 className="mt-2 text-lg font-bold text-slate-950">Model: {active ? "RandomForest" : "Rule Engine"}</h2>
        </div>
        <span className="rounded-2xl bg-blue-50 p-2 text-blue-600">
          {active ? <BrainCircuit size={20} /> : <ShieldCheck size={20} />}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {active ? "Active" : "Fallback"}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">scikit-learn</span>
      </div>

      {active ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-700">Accuracy</p>
              <p className="mt-1 text-lg font-bold text-blue-950">{percent(metrics.accuracy)}</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3">
              <p className="text-xs font-semibold text-violet-700">F1 Score</p>
              <p className="mt-1 text-lg font-bold text-violet-950">{percent(metrics.f1)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">Training Rows: {Number(metrics.training_rows || 0).toLocaleString()}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Top signal: {topSignal}</span>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Rule engine fallback active</p>
          <p className="mt-1 text-sm text-amber-700">{metrics?.message || error || "Train ML model to enable confidence scoring"}</p>
        </div>
      )}
    </section>
  );
}
