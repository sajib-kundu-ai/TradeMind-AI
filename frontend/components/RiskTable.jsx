"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import RiskBadge from "./RiskBadge";

const filters = ["All", "High", "Medium", "Low"];

function money(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function RiskDetail({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="ml-auto flex min-h-full max-w-xl items-center">
        <aside className="w-full rounded-2xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">ReturnGuard order</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{order.order_id}</h3>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close risk details"><X size={18} /></button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Product</p><p className="mt-1 font-semibold text-white">{order.product_name}</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Amount</p><p className="mt-1 font-semibold text-white">{money(order.amount)}</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Risk</p><div className="mt-1"><RiskBadge level={order.risk_level} /></div></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Final score</p><p className="mt-1 font-semibold text-white">{Number(order.final_risk_score ?? (order.risk_score || 0)).toFixed(0)}/100</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Rule score</p><p className="mt-1 font-semibold text-white">{Number(order.rule_score ?? (order.risk_score || 0)).toFixed(0)}/100</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-xs text-slate-400">ML confidence</p><p className="mt-1 font-semibold text-white">{order.ml_available ? `${Math.round(Number(order.ml_confidence || 0) * 100)}%` : "Fallback"}</p></div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-semibold text-white">Reason tags</p>
            <div className="mt-3 flex flex-wrap gap-2">{(order.reasons || []).map((reason) => <span key={reason} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-slate-300">{reason}</span>)}</div>
          </div>
          <div className="mt-5 rounded-2xl bg-blue-500/10 p-4"><p className="text-sm font-semibold text-blue-100">Suggested action</p><p className="mt-1 text-sm text-blue-200">{order.suggested_action}</p></div>
        </aside>
      </div>
    </div>
  );
}

export default function RiskTable({ orders = [] }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders
      .filter((order) => filter === "All" || order.risk_level === filter)
      .filter((order) => !needle || `${order.order_id} ${order.product_name}`.toLowerCase().includes(needle))
      .sort((a, b) => Number(b.final_risk_score ?? (b.risk_score || 0)) - Number(a.final_risk_score ?? (a.risk_score || 0)));
  }, [filter, orders, search]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 tm-glass p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-lg font-bold text-white">ReturnGuard Risk Analysis</h2>
          <p className="mt-1 text-sm text-slate-400">Search, filter, and click rows for explainable risk details.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2">
          <Search size={17} className="text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order or product" className="w-full bg-transparent text-sm outline-none sm:w-64" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item ? "bg-slate-950 text-white" : "bg-white/[0.08] text-slate-300 hover:bg-white/15"}`}>{item}</button>)}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.055] text-xs uppercase tracking-wider text-slate-400">
            <tr><th className="py-3">Order ID</th><th>Product</th><th>Amount</th><th>Risk</th><th>Final</th><th>ML</th><th>Reasons</th><th>Action</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredOrders.map((order) => (
              <tr key={order.order_id} onClick={() => setSelected(order)} className="cursor-pointer transition hover:bg-blue-500/10">
                <td className="py-4 font-semibold text-slate-100">{order.order_id}</td>
                <td>{order.product_name}</td>
                <td>{money(order.amount)}</td>
                <td><RiskBadge level={order.risk_level} /></td>
                <td className="font-semibold">{Number(order.final_risk_score ?? (order.risk_score || 0)).toFixed(0)}/100</td>
                <td>{order.ml_available ? `${Math.round(Number(order.ml_confidence || 0) * 100)}%` : "Fallback"}</td>
                <td><div className="flex flex-wrap gap-2">{(order.reasons || []).slice(0, 3).map((reason) => <span key={reason} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-slate-300">{reason}</span>)}</div></td>
                <td className="font-medium text-slate-100">{order.suggested_action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No matching risk orders found.</p>}
      </div>

      <RiskDetail order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
