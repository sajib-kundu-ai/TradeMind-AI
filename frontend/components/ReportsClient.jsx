"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";
import { getDemoAnalysis, getLatestAnalysis } from "@/lib/api";

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
  try {
    const stored = window.localStorage.getItem("trademind_latest_analysis");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function readToken() {
  try {
    return window.localStorage.getItem("trademind_token");
  } catch {
    return null;
  }
}

export default function ReportsClient({ initialData }) {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return initialData;
    return readLatestAnalysis() || initialData;
  });
  const [dataSource, setDataSource] = useState("Demo dataset");
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const [error, setError] = useState("");

  const loadPreferredData = useCallback(async () => {
    const token = readToken();
    if (token) {
      try {
        const latest = await getLatestAnalysis(token);
        setData(latest);
        window.localStorage.setItem("trademind_latest_analysis", JSON.stringify(latest));
        setDataSource("Latest saved analysis");
        setGeneratedAt(new Date(latest.created_at || Date.now()));
        return;
      } catch {
        setDataSource("Demo dataset");
      }
    }

    try {
      const fresh = await getDemoAnalysis(100);
      setData(fresh);
      setDataSource("Demo dataset");
      setGeneratedAt(new Date());
    } catch (requestError) {
      setError(requestError.message);
    }
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

  return (
    <div className="space-y-7 p-6">
      {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load report data: {error}</p>}

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d1d] p-7 text-white shadow-2xl sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">Report center</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Turn analysis into shareable CSV insight.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">Exports use your latest uploaded analysis when available, otherwise the live demo dataset.</p>
          <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">{dataSource}</span>
        </div>
      </div>

      <div>
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
        </div>
      </div>
    </div>
  );
}
