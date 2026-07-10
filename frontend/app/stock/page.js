"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import StockMindClient from "@/components/StockMindClient";
import { loadPreferredAnalysis, readStoredAnalysis } from "@/lib/analysisSource";

export default function StockPage() {
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

  const summary = data?.stock_summary || {};
  const stocks = data?.stock_items || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />
      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">StockMind</h1>
              <p className="mt-1 text-sm text-slate-500">Monitor stock levels, predict stock-out risk, and get restock suggestions.</p>
            </div>
            <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{dataSource}</span>
          </div>
        </header>
        <div className="space-y-6 p-6">
          {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load stock analysis: {error}</p>}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Products" value={summary.total_products || 0} subtitle={dataSource} tone="blue" />
            <StatCard title="Critical Stock" value={summary.critical_stock || 0} subtitle="Immediate attention" tone="red" />
            <StatCard title="Healthy Stock" value={summary.healthy_stock || 0} subtitle="Stable products" tone="green" />
            <StatCard title="Restock Needed" value={summary.restock_needed || 0} subtitle="Critical + warning" tone="purple" />
          </div>
          <StockMindClient summary={summary} stocks={stocks} />
        </div>
      </section>
    </main>
  );
}
