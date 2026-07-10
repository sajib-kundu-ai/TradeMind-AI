"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { uploadAnalysis } from "@/lib/api";
import RiskBadge from "./RiskBadge";
import DonutChart from "./DonutChart";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setError("");
  }

  async function handleUpload() {
    if (!file) {
      setError("Choose a CSV or XLSX file first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const analysis = await uploadAnalysis(file, 100);
      setResult(analysis);
      window.localStorage.setItem("trademind_latest_analysis", JSON.stringify(analysis));
    } catch (uploadError) {
      setResult(null);
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  }

  function fileSize(value) {
    if (!value) return "";
    if (value > 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Upload Order Data</h2>
            <p className="mt-2 text-sm text-slate-500">
              Upload CSV/XLSX order data to analyze risk, profit, and stock insights.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 p-3 text-white shadow-lg shadow-blue-500/20"><UploadCloud size={24} /></div>
        </div>

        <label className="group mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/80 to-violet-50/70 px-6 py-14 text-center transition duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/70">
          <span className="rounded-2xl bg-white p-4 text-blue-600 shadow-md transition group-hover:scale-105"><UploadCloud size={32} /></span>
          <p className="mt-4 text-sm font-semibold text-slate-700">Click to upload CSV or Excel file</p>
          <p className="mt-1 text-xs text-slate-500">Maximum rows returned: 100</p>
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
        </label>

        {file && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="shrink-0 text-green-600" size={20} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-green-800" title={file.name}>{file.name}</p>
                <p className="text-xs text-green-700">{fileSize(file.size)}</p>
              </div>
            </div>
            <CheckCircle2 className="text-green-600" size={20} />
          </div>
        )}

        {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}

        <button type="button" onClick={handleUpload} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 disabled:cursor-wait disabled:opacity-60">
          {loading && <Loader2 className="animate-spin" size={17} />}
          {loading ? "Analyzing risk, profit, and stock signals..." : "Analyze Orders"}
        </button>
      </div>

      {result && (
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2 text-emerald-600"><CheckCircle2 size={20} /></span><h2 className="text-lg font-bold text-slate-950">Analysis complete</h2></div>
          <p className="mt-1 text-sm text-slate-500">{result.uploaded_file || file?.name} analyzed successfully.</p>
          <p className={`mt-4 rounded-2xl border p-4 text-sm font-medium ${result.saved ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            {result.saved
              ? "Analysis saved to your history."
              : "Analysis completed but was not saved because you are not logged in."}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Orders</p><p className="mt-1 text-2xl font-bold text-blue-950">{result.risk_summary.total_orders}</p></div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-rose-700">High Risk</p><p className="mt-1 text-2xl font-bold text-rose-950">{result.risk_summary.high_risk}</p></div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Net Profit</p><p className="mt-1 text-2xl font-bold text-emerald-950">৳{Number(result.profit_summary.net_profit).toLocaleString()}</p></div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Restock Needed</p><p className="mt-1 text-2xl font-bold text-violet-950">{result.stock_summary.restock_needed}</p></div>
          </div>
          <div className="mt-5">
            <DonutChart
              title="Risk Mix"
              subtitle="Uploaded order risk distribution"
              centerLabel="Orders"
              centerValue={Number(result.risk_summary.total_orders || 0).toLocaleString()}
              embedded
              segments={[
                { label: "Low Risk", value: result.risk_summary.low_risk, color: "#22c55e" },
                { label: "Medium Risk", value: result.risk_summary.medium_risk, color: "#f59e0b" },
                { label: "High Risk", value: result.risk_summary.high_risk, color: "#ef4444" },
              ]}
            />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-3 py-3">Order ID</th><th>Product</th><th>Amount</th><th>Risk</th><th>Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {result.risk_orders.map((order) => (
                  <tr key={order.order_id} className="transition hover:bg-blue-50/40"><td className="px-3 py-4 font-semibold">{order.order_id}</td><td>{order.product_name}</td><td>৳{Number(order.amount).toLocaleString()}</td><td><RiskBadge level={order.risk_level} /></td><td>{order.suggested_action}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
