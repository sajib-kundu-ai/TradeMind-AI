"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import DonutChart from "@/components/DonutChart";
import { loadPreferredAnalysis, readStoredAnalysis } from "@/lib/analysisSource";
import { TrendingUp, WalletCards } from "lucide-react";
import Link from "next/link";

const money = (value) => `৳${Number(value || 0).toLocaleString()}`;
const compactMoney = (value) => {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000) return `৳${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `৳${(amount / 1000).toFixed(1)}K`;
  return money(amount);
};

export default function ProfitPage() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return null;
    return readStoredAnalysis();
  });
  const [dataSource, setDataSource] = useState(() => (data ? "Uploaded analysis" : "No analysis yet"));
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

  const summary = data?.profit_summary || {};
  const products = useMemo(() => data?.profit_products || [], [data]);
  const best = products[0];
  const maxProfit = Math.max(...products.map((product) => Math.max(product.net_profit, 0)), 1);
  const totalSales = Number(summary.total_sales || 1);
  const breakdown = [
    ["Sales", summary.total_sales, "#2563eb"],
    ["Cost", summary.total_cost, "#8b5cf6"],
    ["Shipping", summary.total_shipping, "#f59e0b"],
    ["Net Profit", summary.net_profit, "#22c55e"],
  ];
  const donutSegments = breakdown.map(([label, value, color]) => ({
    label,
    value: Math.abs(Number(value || 0)),
    color,
    displayValue: compactMoney(value),
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />
      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">ProfitDoctor</h1>
              <p className="mt-1 text-sm text-slate-500">Analyze sales, cost, shipping, profit margin, and low-profit products.</p>
            </div>
            <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{dataSource}</span>
          </div>
        </header>
        <div className="space-y-6 p-6">
          {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load profit analysis: {error}</p>}
          {!data && (
            <div className="rounded-3xl border border-white/70 bg-white/85 p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
              <TrendingUp className="mx-auto text-blue-600" size={32} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No profit data yet</h2>
              <p className="mt-2 text-sm text-slate-500">Upload orders to generate profit analysis.</p>
              <Link href="/upload" className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Upload Orders
              </Link>
            </div>
          )}
          {data && (
            <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Sales" value={compactMoney(summary.total_sales)} subtitle={dataSource} tone="blue" />
            <StatCard title="Total Cost" value={compactMoney(summary.total_cost)} subtitle="Product cost" tone="purple" />
            <StatCard title="Net Profit" value={compactMoney(summary.net_profit)} subtitle="After shipping" tone="green" />
            <StatCard title="Profit Margin" value={`${summary.profit_margin || 0}%`} subtitle="Overall margin" tone="blue" />
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <ChartCard title="Profit Performance" subtitle="Top product profit overview">
              <div className="space-y-5">
                {products.slice(0, 5).map((product) => (
                  <div key={`${product.product_name}-${product.product_category}`}>
                    <div className="mb-2 flex justify-between gap-4 text-sm">
                      <span className="truncate font-medium text-slate-700">{product.product_name}</span>
                      <span className="shrink-0 text-slate-500">{money(product.net_profit)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className="h-3 rounded-full bg-green-500" style={{ width: `${Math.max((product.net_profit / maxProfit) * 100, 0)}%` }} />
                    </div>
                  </div>
                ))}
                {products.length === 0 && <p className="text-sm text-slate-500">No product data found.</p>}
              </div>
            </ChartCard>

            <DonutChart
              title="Financial Breakdown"
              subtitle="Sales, cost, shipping and retained profit"
              segments={donutSegments}
              centerLabel="Sales"
              centerValue={compactMoney(summary.total_sales)}
            />

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <WalletCards className="text-green-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Best Profit Product</h2>
              <p className="mt-2 text-sm text-slate-500">{best ? `${best.product_name} has the highest net profit in this dataset.` : "No product data available."}</p>
              <div className="mt-5 rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-green-700">Profit</p>
                <p className="mt-1 text-3xl font-bold text-green-800">{money(best?.net_profit)}</p>
              </div>
            </div>
          </div>

          <ChartCard title="Financial Bars" subtitle="Relative share against total sales">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {breakdown.map(([label, value, color]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-500">{compactMoney(value)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div className="h-3 rounded-full" style={{ width: `${Math.min(Math.abs(Number(value || 0)) / totalSales * 100, 100)}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3"><TrendingUp className="text-blue-600" size={24} /><div><h2 className="text-lg font-bold text-slate-950">Product-wise Profit Table</h2><p className="mt-1 text-sm text-slate-500">Low-margin products are highlighted for pricing or cost review.</p></div></div>
            <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="py-3">Product</th><th>Sales</th><th>Cost</th><th>Shipping</th><th>Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody className="divide-y">{products.map((product) => <tr key={`${product.product_name}-${product.product_category}`} className={product.status === "Low Margin" ? "bg-red-50/60" : "transition hover:bg-blue-50/40"}><td className="py-4 font-semibold text-slate-900">{product.product_name}</td><td>{money(product.total_sales)}</td><td>{money(product.total_cost)}</td><td>{money(product.total_shipping)}</td><td className="font-semibold text-green-700">{money(product.net_profit)}</td><td>{product.profit_margin}%</td><td><span className={product.status === "Healthy" ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700" : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"}>{product.status}</span></td></tr>)}</tbody></table>{products.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No product data found.</p>}</div>
          </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
