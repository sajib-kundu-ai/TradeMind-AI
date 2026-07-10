"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, FileText, PackageCheck, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { getLatestAnalysis } from "@/lib/api";
import { readStoredAnalysis, saveStoredAnalysis } from "@/lib/analysisSource";

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function readLatestAnalysis() {
  return readStoredAnalysis();
}

function readToken() {
  try {
    return window.localStorage.getItem("trademind_token");
  } catch {
    return null;
  }
}

export default function ReportsClient() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return null;
    return readStoredAnalysis();
  });
  const [dataSource, setDataSource] = useState(() => (data ? "Uploaded analysis" : "No analysis yet"));
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const [error, setError] = useState("");

  const loadPreferredData = useCallback(async () => {
    const token = readToken();
    if (token) {
      try {
        const latest = await getLatestAnalysis(token);
        setData(latest);
        saveStoredAnalysis(latest);
        setDataSource("Latest saved analysis");
        setGeneratedAt(new Date(latest.created_at || Date.now()));
        return;
      } catch {
        // Continue to uploaded-analysis fallback.
      }
    }

    const stored = readLatestAnalysis();
    if (stored) {
      setData(stored);
      setDataSource("Uploaded analysis");
      setGeneratedAt(new Date(stored.created_at || Date.now()));
      return;
    }

    setData(null);
    setDataSource("No analysis yet");
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadPreferredData();
    });
  }, [loadPreferredData]);

  const reports = useMemo(() => [
    {
      title: "Risk Report CSV",
      description: "Order risk scores, reason tags, and recommended verification actions.",
      icon: ShieldCheck,
      tone: "from-blue-500 to-cyan-400",
      build: () => toCsv(
        ["order_id", "product_name", "amount", "risk_level", "risk_score", "reasons", "suggested_action"],
        (data?.risk_orders || []).map((order) => [order.order_id, order.product_name, order.amount, order.risk_level, order.risk_score, (order.reasons || []).join("; "), order.suggested_action])
      ),
      filename: "trademind-risk-report.csv",
    },
    {
      title: "Profit Report CSV",
      description: "Revenue, cost, net margin, and product-level profitability summary.",
      icon: TrendingUp,
      tone: "from-emerald-500 to-teal-400",
      build: () => toCsv(
        ["product_name", "category", "sales", "cost", "shipping", "net_profit", "profit_margin", "status"],
        (data?.profit_products || []).map((product) => [product.product_name, product.product_category, product.total_sales, product.total_cost, product.total_shipping, product.net_profit, product.profit_margin, product.status])
      ),
      filename: "trademind-profit-report.csv",
    },
    {
      title: "Stock Report CSV",
      description: "Inventory health, stock-out forecasts, and restock recommendations.",
      icon: PackageCheck,
      tone: "from-violet-500 to-fuchsia-400",
      build: () => toCsv(
        ["product_name", "category", "current_stock", "avg_daily_sales", "days_left", "recommended_restock", "status", "suggestion"],
        (data?.stock_items || []).map((item) => [item.product_name, item.product_category, item.current_stock, item.avg_daily_sales, item.days_left, item.recommended_restock, item.status, item.suggestion])
      ),
      filename: "trademind-stock-report.csv",
    },
    {
      title: "Full Business Summary CSV",
      description: "Top-level risk, profit, and stock summary for project showcase.",
      icon: FileDown,
      tone: "from-slate-700 to-blue-500",
      build: () => toCsv(
        ["section", "metric", "value"],
        [
          ...Object.entries(data?.risk_summary || {}).map(([metric, value]) => ["risk", metric, value]),
          ...Object.entries(data?.profit_summary || {}).map(([metric, value]) => ["profit", metric, value]),
          ...Object.entries(data?.stock_summary || {}).map(([metric, value]) => ["stock", metric, value]),
        ]
      ),
      filename: "trademind-business-summary.csv",
    },
  ], [data]);

  const smartSuggestions = data?.smart_suggestions || {};
  const hasActionPlan = Boolean(
    smartSuggestions.overall_health ||
    smartSuggestions.priority_actions?.length ||
    smartSuggestions.seller_next_steps?.length
  );

  return (
    <div className="space-y-7 p-6">
      {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load report data: {error}</p>}

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d1d] p-7 text-white shadow-2xl sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">Report center</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Turn analysis into shareable CSV insight.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">Exports use your latest saved or uploaded analysis. Demo data is only loaded from the Dashboard preview.</p>
          <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">{dataSource}</span>
        </div>
      </div>

      <div>
        {!data && (
          <section className="mb-7 rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <FileText className="mx-auto text-blue-600" size={32} />
            <h2 className="mt-4 text-xl font-bold text-slate-950">No report data yet</h2>
            <p className="mt-2 text-sm text-slate-500">Upload orders first.</p>
          </section>
        )}
        {data && (
          <>
        <section className="mb-7 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AI Summary Preview</p>
              <h2 className="mt-2 text-lg font-bold text-slate-950">Smart Action Plan</h2>
            </div>
            <span className="rounded-2xl bg-blue-50 p-2 text-blue-600"><Sparkles size={20} /></span>
          </div>
          {hasActionPlan ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Overall Health</p>
                <p className="mt-1 font-bold text-blue-950">{smartSuggestions.overall_health}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Priority Actions</p>
                <p className="mt-1 text-sm text-slate-700">{smartSuggestions.priority_actions?.[0]}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Risk Plan</p>
                <p className="mt-1 text-sm text-rose-800">{smartSuggestions.risk_suggestions?.[0]}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Profit Plan</p>
                <p className="mt-1 text-sm text-emerald-800">{smartSuggestions.profit_suggestions?.[0]}</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Stock Plan</p>
                <p className="mt-1 text-sm text-violet-800">{smartSuggestions.stock_suggestions?.[0]}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Seller Next Steps</p>
                <p className="mt-1 text-sm text-slate-200">{smartSuggestions.seller_next_steps?.[0]}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-medium text-amber-800">Upload or re-analyze orders to generate AI action plan.</p>
          )}
        </section>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-950">Available report downloads</h2>
          <p className="mt-1 text-sm text-slate-500">Data source: {dataSource} · Last generated timestamp: {generatedAt.toLocaleString()}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {reports.map(({ title, description, icon: Icon, tone, build, filename }) => (
            <article key={title} className="group overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}><Icon size={23} /></div>
              <h3 className="mt-6 text-lg font-bold text-slate-950">{title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-500">{description}</p>
              <button type="button" disabled={!data} onClick={() => downloadCsv(filename, build())} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                <FileDown size={17} /> Download CSV
              </button>
            </article>
          ))}
          <article className="overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white/55 p-6 opacity-75">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><FileText size={23} /></div>
            <h3 className="mt-6 text-lg font-bold text-slate-700">PDF Executive Report</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-slate-500">Polished PDF export for stakeholder review.</p>
            <button type="button" disabled className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500">
              Coming soon
            </button>
          </article>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
