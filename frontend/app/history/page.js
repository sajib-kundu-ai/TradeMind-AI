"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  FileText,
  Loader2,
  PackageCheck,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { deleteHistoryItem, getHistory, getHistoryItem, reanalyzeHistoryItem } from "@/lib/api";
import { readStoredAnalysis, saveStoredAnalysis } from "@/lib/analysisSource";

function readToken() {
  try {
    return window.localStorage.getItem("trademind_token");
  } catch {
    return null;
  }
}

function money(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

function DetailDrawer({ item, loading, onClose }) {
  if (!item && !loading) return null;

  const risk = item?.risk_summary || {};
  const profit = item?.profit_summary || {};
  const stock = item?.stock_summary || {};
  const suggestions = item?.smart_suggestions || {};
  const firstOrder = item?.risk_orders?.[0] || {};
  const mlActive = Boolean(firstOrder.ml_available);

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/55 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="ml-auto flex min-h-full max-w-2xl items-center">
        <aside className="w-full rounded-2xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Saved analysis</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{item?.file_name || "Loading analysis"}</h2>
              {item?.created_at && <p className="mt-1 text-sm text-slate-400">{formatDate(item.created_at)}</p>}
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close history details">
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-5 text-sm font-medium text-slate-300">
              <Loader2 className="animate-spin text-cyan-300" size={18} /> Loading saved analysis...
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Total orders</p><p className="mt-1 text-2xl font-bold text-blue-100">{risk.total_orders || item?.total_orders || 0}</p></div>
                <div className="rounded-2xl bg-rose-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-rose-200">High risk</p><p className="mt-1 text-2xl font-bold text-rose-100">{risk.high_risk || item?.high_risk_orders || 0}</p></div>
                <div className="rounded-2xl bg-emerald-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Net profit</p><p className="mt-1 text-2xl font-bold text-emerald-100">{money(profit.net_profit || item?.net_profit)}</p></div>
                <div className="rounded-2xl bg-violet-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-200">Restock needed</p><p className="mt-1 text-2xl font-bold text-violet-100">{stock.restock_needed || item?.restock_needed || 0}</p></div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link href="/returnguard" className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20">
                  <ShieldCheck size={17} /> View Risk Report
                </Link>
                <Link href="/profit" className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                  <TrendingUp size={17} /> View Profit Report
                </Link>
                <Link href="/stock" className="flex items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20">
                  <PackageCheck size={17} /> View Stock Report
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-blue-500/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">AI Status</p>
                    <p className="mt-1 text-sm text-slate-300">ML Status: {mlActive ? "Active" : "Fallback"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item?.analysis_version && <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-blue-200">{item.analysis_version}</span>}
                    {item?.reanalyzed_at && <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-blue-200">Re-analyzed {formatDate(item.reanalyzed_at)}</span>}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl tm-glass p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Health</p>
                    <p className="mt-1 font-semibold text-white">{suggestions.overall_health || "Upload or re-analyze orders to generate AI action plan."}</p>
                  </div>
                  <div className="rounded-2xl tm-glass p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority Actions</p>
                    <p className="mt-1 text-sm text-slate-300">{suggestions.priority_actions?.[0] || "No priority actions available yet."}</p>
                  </div>
                  <div className="rounded-2xl tm-glass p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Seller Next Steps</p>
                    <p className="mt-1 text-sm text-slate-300">{suggestions.seller_next_steps?.[0] || "Review the queue after re-analysis."}</p>
                  </div>
                  <div className="rounded-2xl tm-glass p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ML Confidence</p>
                    <p className="mt-1 text-sm font-semibold text-white">{mlActive ? `${Math.round(Number(firstOrder.ml_confidence || 0) * 100)}% on first order` : "Fallback"}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reanalyzingId, setReanalyzingId] = useState(null);
  const [error, setError] = useState("");

  const totals = useMemo(() => ({
    runs: items.length,
    orders: items.reduce((sum, item) => sum + Number(item.total_orders || 0), 0),
    highRisk: items.reduce((sum, item) => sum + Number(item.high_risk_orders || 0), 0),
  }), [items]);

  const loadHistory = useCallback(async () => {
    const token = readToken();
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const history = await getHistory(token);
      setItems(history);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadHistory();
    });
  }, [loadHistory]);

  async function openDetails(id) {
    const token = readToken();
    if (!token) return;

    setDetailLoading(true);
    setSelected(null);
    try {
      const item = await getHistoryItem(token, id);
      setSelected(item);
      saveStoredAnalysis(item);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function deleteItem(id) {
    const token = readToken();
    if (!token) return;

    setError("");
    try {
      await deleteHistoryItem(token, id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function reanalyzeItem(id) {
    const token = readToken();
    if (!token) return;

    setReanalyzingId(id);
    setError("");
    try {
      const response = await reanalyzeHistoryItem(id, token);
      const analysis = response.analysis;
      const updatedSummary = {
        id: analysis.id,
        file_name: analysis.file_name,
        total_orders: analysis.total_orders,
        high_risk_orders: analysis.high_risk_orders,
        net_profit: analysis.net_profit,
        restock_needed: analysis.restock_needed,
        created_at: analysis.created_at,
        reanalyzed_at: analysis.reanalyzed_at,
        analysis_version: analysis.analysis_version,
      };
      setItems((current) => current.map((item) => (item.id === id ? { ...item, ...updatedSummary } : item)));
      if (selected?.id === id) setSelected(analysis);

      const parsed = readStoredAnalysis();
      if (parsed?.analysis_id === id || parsed?.id === id || items[0]?.id === id) {
        saveStoredAnalysis(analysis);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setReanalyzingId(null);
    }
  }

  return (
    <main className="tm-dark-app pb-24 lg:pb-0">
      <Sidebar />

      <section className="tm-app-content lg:pl-64">
        <header className="tm-app-header px-6 py-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">History</h1>
              <p className="mt-1 text-sm text-slate-400">Review saved upload analyses for your signed-in workspace.</p>
            </div>
            <Link href="/upload" className="inline-flex w-fit items-center gap-2 rounded-2xl tm-button-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              <FileText size={17} /> Upload Orders
            </Link>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {error && <p className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-5 text-sm font-medium text-rose-200">{error}</p>}

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 tm-glass p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saved runs</p><p className="mt-2 text-3xl font-bold text-white">{totals.runs}</p></div>
            <div className="rounded-2xl border border-white/10 tm-glass p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Orders analyzed</p><p className="mt-2 text-3xl font-bold text-blue-100">{totals.orders}</p></div>
            <div className="rounded-2xl border border-white/10 tm-glass p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">High-risk orders</p><p className="mt-2 text-3xl font-bold text-rose-100">{totals.highRisk}</p></div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 tm-glass shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-white">Previous analysis runs</h2>
                <p className="mt-1 text-sm text-slate-400">Only analyses saved under your login are shown.</p>
              </div>
              <BarChart3 className="text-cyan-300" size={22} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 p-10 text-sm font-medium text-slate-400">
                <Loader2 className="animate-spin text-cyan-300" size={18} /> Loading history...
              </div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-cyan-300"><FileText size={25} /></div>
                <h3 className="mt-5 text-xl font-bold text-white">No saved analyses yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Upload an order file while logged in and TradeMind AI will save the analysis here.</p>
                <Link href="/upload" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
                  <FileText size={17} /> Upload Orders
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.06] text-xs uppercase tracking-wider text-slate-400">
                    <tr><th className="px-6 py-4">File name</th><th>Total orders</th><th>High risk</th><th>Net profit</th><th>Restock needed</th><th>Updated</th><th className="text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {items.map((item) => (
                      <tr key={item.id} className="transition hover:bg-blue-500/10">
                        <td className="px-6 py-4 font-semibold text-white">{item.file_name}</td>
                        <td>{item.total_orders}</td>
                        <td><span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">{item.high_risk_orders}</span></td>
                        <td className="font-semibold text-emerald-200">{money(item.net_profit)}</td>
                        <td>{item.restock_needed}</td>
                        <td className="text-slate-400">{formatDate(item.reanalyzed_at || item.created_at)}</td>
                        <td>
                          <div className="flex justify-end gap-2 pr-6">
                            <button type="button" onClick={() => openDetails(item.id)} className="rounded-xl border border-cyan-300/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20">View Details</button>
                            <button type="button" onClick={() => reanalyzeItem(item.id)} disabled={reanalyzingId === item.id} className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60">
                              {reanalyzingId === item.id ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
                              Re-analyze
                            </button>
                            <button type="button" onClick={() => deleteItem(item.id)} className="rounded-xl border border-rose-300/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20" aria-label={`Delete ${item.file_name}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>

      <DetailDrawer item={selected} loading={detailLoading} onClose={() => { setSelected(null); setDetailLoading(false); }} />
    </main>
  );
}
