"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, Sparkles, X } from "lucide-react";
import RiskBadge from "./RiskBadge";
import StatCard from "./StatCard";
import { getDemoAnalysis, getLatestAnalysis } from "@/lib/api";

const riskFilters = ["All", "High", "Medium", "Low"];

function money(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function compactMoney(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000) return `৳${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `৳${(amount / 1000).toFixed(1)}K`;
  return money(amount);
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

function calculateHealthScore(risk, profit, stock) {
  const total = Number(risk.total_orders || 0);
  const highRiskRate = total ? Number(risk.high_risk || 0) / total : 0;
  const margin = Math.min(Number(profit.profit_margin || 0), 45) / 45;
  const stockTotal = Number(stock.total_products || 0);
  const stockRisk = stockTotal ? Number(stock.restock_needed || 0) / stockTotal : 0;
  return Math.max(35, Math.min(96, Math.round(58 + margin * 30 - highRiskRate * 18 - stockRisk * 10)));
}

function OrderModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="ml-auto flex min-h-full max-w-xl items-center">
        <aside className="w-full rounded-3xl border border-white/20 bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Order detail</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">{order.order_id}</h3>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950" aria-label="Close order details">
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Product</p><p className="mt-1 font-semibold text-slate-950">{order.product_name}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-semibold text-slate-950">{money(order.amount)}</p></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Risk level</p><div className="mt-1"><RiskBadge level={order.risk_level} /></div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Risk score</p><p className="mt-1 font-semibold text-slate-950">{order.risk_score}/100</p></div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-950">Reasons</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(order.reasons || ["Risk pattern detected"]).map((reason) => <span key={reason} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{reason}</span>)}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-950">Suggested action</p>
            <p className="mt-1 text-sm text-blue-700">{order.suggested_action}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function DashboardCommandCenter({ initialData }) {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return initialData;
    return readLatestAnalysis() || initialData;
  });
  const [dataSource, setDataSource] = useState("Showing demo dataset");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPreferredData = useCallback(async () => {
    const token = readToken();
    if (token) {
      try {
        const latest = await getLatestAnalysis(token);
        setData(latest);
        window.localStorage.setItem("trademind_latest_analysis", JSON.stringify(latest));
        setDataSource("Showing latest saved analysis");
        setLastUpdated(new Date(latest.created_at || Date.now()));
        return;
      } catch {
        setDataSource("Showing demo dataset");
      }
    }

    try {
      const fresh = await getDemoAnalysis(100);
      setData(fresh);
      setDataSource("Showing demo dataset");
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadPreferredData();
    });
  }, [loadPreferredData]);

  async function refreshData() {
    setRefreshing(true);
    setError("");
    try {
      await loadPreferredData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRefreshing(false);
    }
  }

  const risk = data?.risk_summary || {};
  const profit = data?.profit_summary || {};
  const stock = data?.stock_summary || {};
  const orders = useMemo(() => data?.risk_orders || [], [data]);
  const smartSuggestions = data?.smart_suggestions || {};
  const headlineSuggestion = smartSuggestions.priority_actions?.[0] || "High-risk COD orders need verification before shipping.";
  const nextStep = smartSuggestions.seller_next_steps?.[0] || "Review the risk queue before fulfillment.";
  const healthScore = calculateHealthScore(risk, profit, stock);
  const riskPercent = (value) => risk.total_orders ? Math.round(((value || 0) / risk.total_orders) * 100) : 0;

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders
      .filter((order) => filter === "All" || order.risk_level === filter)
      .filter((order) => !needle || `${order.order_id} ${order.product_name}`.toLowerCase().includes(needle))
      .sort((a, b) => sortBy === "amount" ? Number(b.amount || 0) - Number(a.amount || 0) : Number(b.final_risk_score ?? (b.risk_score || 0)) - Number(a.final_risk_score ?? (a.risk_score || 0)));
  }, [filter, orders, search, sortBy]);

  return (
    <div className="space-y-6 p-6">
      {!data && <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-sm font-medium text-yellow-800">Backend API চালু নেই। Real data দেখতে backend server run করো।</div>}
      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">Could not refresh dashboard: {error}</div>}

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d1d] p-6 text-white shadow-2xl">
          <div className="pointer-events-none absolute right-[-100px] top-[-160px] h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200"><Sparkles size={14} /> AI insight</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">{headlineSuggestion}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{nextStep} Profit margin is {profit.profit_margin || 0}% and {risk.high_risk || 0} high-risk orders should be reviewed before fulfillment.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-2 font-semibold text-blue-100">{dataSource}</span>
              <span>Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <button type="button" onClick={refreshData} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-semibold text-white transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-60">
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Business Health Score</p>
          <div className="mt-5 flex items-end gap-2"><span className="text-5xl font-bold tracking-tight text-slate-950">{healthScore}</span><span className="mb-2 text-lg font-semibold text-slate-400">/100</span></div>
          <div className="mt-5 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `${healthScore}%` }} /></div>
          <p className="mt-4 text-sm text-slate-500">Blends risk exposure, profit margin, and stock pressure into a demo-ready health indicator.</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => setFilter("All")} className="text-left"><StatCard title="Total Orders" value={risk.total_orders || 0} subtitle="Click to show all orders" tone="blue" /></button>
        <button type="button" onClick={() => setFilter("High")} className="text-left"><StatCard title="High Risk Orders" value={risk.high_risk || 0} subtitle="Click to filter verification queue" tone="red" /></button>
        <Link href="/profit" className="text-left"><StatCard title="Net Profit" value={compactMoney(profit.net_profit)} subtitle={`${profit.profit_margin || 0}% margin`} tone="green" /></Link>
        <Link href="/stock" className="text-left"><StatCard title="Restock Needed" value={stock.restock_needed || 0} subtitle="Open StockMind alerts" tone="purple" /></Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-950">Risk Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Click a segment to filter the recent order queue.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[["Low", risk.low_risk, "bg-emerald-500", "text-emerald-700"], ["Medium", risk.medium_risk, "bg-amber-500", "text-amber-700"], ["High", risk.high_risk, "bg-rose-500", "text-rose-700"]].map(([level, value, color, text]) => (
              <button key={level} type="button" onClick={() => setFilter(level)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${filter === level ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center justify-between"><span className={`font-semibold ${text}`}>{level}</span><span className="text-sm text-slate-500">{value || 0} orders</span></div>
                <div className="mt-4 h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: `${riskPercent(value)}%` }} /></div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Stock Alerts</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Link href="/stock" className="block rounded-2xl bg-red-50 p-4 font-semibold text-red-700 transition hover:bg-red-100">{stock.critical_stock || 0} critical products</Link>
            <Link href="/stock" className="block rounded-2xl bg-amber-50 p-4 font-semibold text-amber-700 transition hover:bg-amber-100">{stock.warning_stock || 0} warning products</Link>
            <Link href="/stock" className="block rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-700 transition hover:bg-emerald-100">{stock.healthy_stock || 0} healthy products</Link>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div><h2 className="text-lg font-semibold text-slate-950">Recent Risky Orders</h2><p className="mt-1 text-sm text-slate-500">Search, filter, sort, and open any order for details.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2"><Search size={17} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order or product" className="w-full bg-transparent text-sm outline-none sm:w-56" /></div>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"><option value="score">Sort by risk score</option><option value="amount">Sort by amount</option></select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{riskFilters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item}</button>)}</div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500"><tr><th className="py-3">Order ID</th><th>Product</th><th>Amount</th><th>Risk</th><th>Final</th><th>ML</th><th>Suggested Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filteredOrders.map((order) => <tr key={order.order_id} onClick={() => setSelectedOrder(order)} className="cursor-pointer transition hover:bg-blue-50/60"><td className="py-4 font-semibold text-slate-900">{order.order_id}</td><td>{order.product_name}</td><td>{money(order.amount)}</td><td><RiskBadge level={order.risk_level} /></td><td>{Number(order.final_risk_score ?? (order.risk_score || 0)).toFixed(0)}/100</td><td>{order.ml_available ? `${Math.round(Number(order.ml_confidence || 0) * 100)}%` : "Rule"}</td><td className="font-medium text-slate-900">{order.suggested_action}</td></tr>)}</tbody>
          </table>
          {filteredOrders.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No matching orders found.</p>}
        </div>
      </section>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
