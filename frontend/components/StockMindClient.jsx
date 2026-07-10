"use client";

import { useMemo, useState } from "react";
import ChartCard from "./ChartCard";

const filters = ["All", "Critical", "Warning", "Healthy", "No Sales Data"];

function statusClass(status) {
  if (status === "Healthy") return "bg-green-100 text-green-700";
  if (status === "Warning") return "bg-yellow-100 text-yellow-700";
  if (status === "No Sales Data") return "bg-slate-100 text-slate-700";
  return "bg-red-100 text-red-700";
}

function dayClass(item) {
  if (item.status === "Critical") return "bg-red-50 text-red-700";
  if (item.status === "Warning") return "bg-yellow-50 text-yellow-700";
  if (item.status === "No Sales Data") return "bg-slate-100 text-slate-600";
  return "bg-green-50 text-green-700";
}

export default function StockMindClient({ summary = {}, stocks = [] }) {
  const [filter, setFilter] = useState("All");
  const total = summary.total_products || 1;
  const percent = (value) => Math.round(((value || 0) / total) * 100);
  const filteredStocks = useMemo(() => stocks.filter((item) => filter === "All" || item.status === filter), [filter, stocks]);
  const priority = stocks.find((item) => item.status === "Critical") || stocks.find((item) => item.status === "Warning");

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Stock Health" subtitle="Click a status chip below to filter the table">
          <div className="space-y-5">{[["Healthy Stock", summary.healthy_stock, "bg-green-500"], ["Restock Soon", summary.warning_stock, "bg-yellow-500"], ["Critical", summary.critical_stock, "bg-red-500"]].map(([label, value, color]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{percent(value)}%</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${color}`} style={{ width: `${percent(value)}%` }} /></div></div>)}</div>
        </ChartCard>
        <div className="rounded-3xl border border-red-100 bg-red-50/70 p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Restock Priority</h2>
          <p className="mt-2 text-sm text-slate-500">{priority ? `${priority.product_name} should be handled first.` : "No urgent stock alerts."}</p>
          <div className="mt-5 rounded-2xl bg-white/75 p-4">
            <p className="text-sm text-red-700">Recommended Restock</p>
            <p className="mt-1 text-3xl font-bold text-red-800">{priority?.recommended_restock || 0} pcs</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">Days-left Guide</h2>
          <div className="mt-5 space-y-3 text-sm">
            <p className="rounded-2xl bg-red-50 p-3 font-medium text-red-700">Critical: immediate action</p>
            <p className="rounded-2xl bg-yellow-50 p-3 font-medium text-yellow-700">Warning: restock soon</p>
            <p className="rounded-2xl bg-green-50 p-3 font-medium text-green-700">Healthy: stable inventory</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div><h2 className="text-lg font-bold text-slate-950">Stock Recommendation Table</h2><p className="mt-1 text-sm text-slate-500">Filter by stock status and review days-left urgency.</p></div>
          <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item}</button>)}</div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b text-slate-500"><tr><th className="py-3">Product</th><th>Current Stock</th><th>Daily Sales</th><th>Days Left</th><th>Restock</th><th>Suggestion</th><th>Status</th></tr></thead>
            <tbody className="divide-y">
              {filteredStocks.map((item) => <tr key={`${item.product_name}-${item.product_category}`} className="transition hover:bg-blue-50/40"><td className="py-4 font-semibold text-slate-900">{item.product_name}</td><td>{item.current_stock} pcs</td><td>{Number(item.avg_daily_sales).toFixed(1)} pcs/day</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${dayClass(item)}`}>{item.days_left === null || item.days_left === undefined ? "No sales" : `${item.days_left} days`}</span></td><td>{item.recommended_restock || 0} pcs</td><td className="font-medium text-slate-900">{item.suggestion}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.status)}`}>{item.status}</span></td></tr>)}
            </tbody>
          </table>
          {filteredStocks.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No stock items match this filter.</p>}
        </div>
      </div>
    </>
  );
}
