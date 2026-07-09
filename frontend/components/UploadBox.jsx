"use client";

import { useState } from "react";
import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { uploadAnalysis } from "@/lib/api";
import RiskBadge from "./RiskBadge";

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
      setResult(await uploadAnalysis(file, 100));
    } catch (uploadError) {
      setResult(null);
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Upload Order Data</h2>
            <p className="mt-2 text-sm text-slate-500">
              Upload CSV/XLSX order data to analyze risk, profit, and stock insights.
            </p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><UploadCloud size={24} /></div>
        </div>

        <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50">
          <UploadCloud className="text-slate-400" size={42} />
          <p className="mt-4 text-sm font-semibold text-slate-700">Click to upload CSV or Excel file</p>
          <p className="mt-1 text-xs text-slate-500">Maximum rows returned: 100</p>
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileChange} />
        </label>

        {file && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3"><FileText className="text-green-600" size={20} /><span className="text-sm font-medium text-green-800">{file.name}</span></div>
            <CheckCircle2 className="text-green-600" size={20} />
          </div>
        )}

        {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}

        <button type="button" onClick={handleUpload} disabled={loading} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">
          {loading ? "Analyzing…" : "Analyze Orders"}
        </button>
      </div>

      {result && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Analysis Result</h2>
          <p className="mt-1 text-sm text-slate-500">{result.uploaded_file} analyzed successfully.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs text-blue-700">Orders</p><p className="mt-1 text-2xl font-bold text-blue-950">{result.risk_summary.total_orders}</p></div>
            <div className="rounded-2xl bg-green-50 p-4"><p className="text-xs text-green-700">Net Profit</p><p className="mt-1 text-2xl font-bold text-green-950">৳{Number(result.profit_summary.net_profit).toLocaleString()}</p></div>
            <div className="rounded-2xl bg-purple-50 p-4"><p className="text-xs text-purple-700">Restock Needed</p><p className="mt-1 text-2xl font-bold text-purple-950">{result.stock_summary.restock_needed}</p></div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-slate-500"><tr><th className="py-3">Order ID</th><th>Product</th><th>Amount</th><th>Risk</th><th>Action</th></tr></thead>
              <tbody className="divide-y">
                {result.risk_orders.map((order) => (
                  <tr key={order.order_id}><td className="py-4 font-semibold">{order.order_id}</td><td>{order.product_name}</td><td>৳{Number(order.amount).toLocaleString()}</td><td><RiskBadge level={order.risk_level} /></td><td>{order.suggested_action}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
