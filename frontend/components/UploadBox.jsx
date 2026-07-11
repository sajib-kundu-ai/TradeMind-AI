"use client";

import { useState } from "react";
import Link from "next/link";
import { BrainCircuit, CheckCircle2, Download, FileText, Loader2, ShieldCheck, Sparkles, TrendingUp, UploadCloud, Warehouse } from "lucide-react";
import { uploadAnalysis } from "@/lib/api";
import { saveStoredAnalysis } from "@/lib/analysisSource";
import RiskBadge from "./RiskBadge";
import DonutChart from "./DonutChart";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const sampleHeaders = [
  "order_id",
  "product_name",
  "payment_type",
  "amount",
  "customer_type",
  "phone_verified",
  "address_complete",
  "distance_km",
  "previous_returns",
  "order_hour",
  "cost_price",
  "shipping_cost",
  "current_stock",
  "avg_daily_sales",
  "product_category",
  "quantity",
  "email_verified",
  "previous_orders",
  "coupon_used",
  "account_age_days",
];

const sampleRows = [
  ["TM-1001", "Bluetooth Speaker", "COD", 8200, "New", "No", "No", 78, 1, 23, 5100, 420, 12, 3, "Electronics", 1, "Yes", 0, "Yes", 8],
  ["TM-1002", "Cotton T-Shirt", "Prepaid", 1200, "Returning", "Yes", "Yes", 8, 0, 14, 650, 90, 80, 6, "Fashion", 2, "Yes", 5, "No", 220],
  ["TM-1003", "Smart Watch", "COD", 6100, "New", "Yes", "Yes", 42, 0, 21, 3900, 300, 9, 2, "Electronics", 1, "Yes", 0, "Yes", 18],
  ["TM-1004", "Ceramic Mug", "Prepaid", 700, "Returning", "Yes", "Yes", 5, 0, 11, 300, 60, 140, 4, "Home", 3, "Yes", 7, "No", 300],
  ["TM-1005", "Running Shoes", "COD", 4500, "New", "No", "Yes", 64, 2, 22, 2600, 380, 6, 1, "Fashion", 1, "No", 1, "Yes", 12],
  ["TM-1006", "Face Serum", "Prepaid", 1800, "Returning", "Yes", "Yes", 12, 0, 16, 820, 110, 45, 5, "Beauty", 1, "Yes", 3, "No", 120],
  ["TM-1007", "Office Chair", "COD", 9500, "New", "Yes", "No", 88, 1, 1, 6500, 700, 3, 1, "Furniture", 1, "Yes", 0, "No", 5],
  ["TM-1008", "Kids Backpack", "Prepaid", 1500, "Returning", "Yes", "Yes", 18, 0, 10, 760, 120, 30, 2, "Accessories", 1, "Yes", 8, "Yes", 180],
  ["TM-1009", "Rice Cooker", "COD", 5200, "New", "Yes", "Yes", 36, 0, 19, 3600, 260, 18, 2, "Appliances", 1, "Yes", 0, "No", 35],
];

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function validateUploadFile(selected) {
  if (!selected) {
    return "Choose a CSV or XLSX file first.";
  }

  const name = selected.name.toLowerCase();
  if (!name.endsWith(".csv") && !name.endsWith(".xlsx")) {
    return "Only CSV and Excel .xlsx files are supported.";
  }

  if (selected.size === 0) {
    return "Selected file is empty. Choose a CSV or XLSX file with order data.";
  }

  if (selected.size > MAX_UPLOAD_BYTES) {
    return "Selected file is too large. Upload a CSV/XLSX file under 10 MB.";
  }

  return "";
}

export default function UploadBox() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;
    const validationError = validateUploadFile(selected);

    if (validationError && selected) {
      setSelectedFile(null);
      setError(validationError);
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(selected);
    if (selected) {
      setResult(null);
    }
  }

  async function handleUpload() {
    if (loading) {
      return;
    }

    const validationError = validateUploadFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const analysis = await uploadAnalysis(selectedFile, 300);
      setResult(analysis);
      saveStoredAnalysis(analysis);
    } catch (uploadError) {
      setResult(null);
      setError(uploadError.message || "Order upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function fileSize(value) {
    if (!value) return "";
    if (value > 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
    return `${(value / 1024).toFixed(1)} KB`;
  }

  function downloadSampleCsv() {
    const content = [sampleHeaders, ...sampleRows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trademind-sample-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const mlActive = (result?.risk_orders || []).some((order) => order.ml_available);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 tm-glass p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Order Data</h2>
            <p className="mt-2 text-sm text-slate-400">
              Upload CSV/XLSX order data to analyze risk, profit, and stock insights.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 p-3 text-white shadow-lg shadow-blue-500/20"><UploadCloud size={24} /></div>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-5">
          <label htmlFor="orders-file" className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-200">
            <span className="rounded-xl bg-slate-900/70 p-2 text-cyan-300 shadow-md"><UploadCloud size={20} /></span>
            Upload CSV or Excel file
          </label>
          <input
            id="orders-file"
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-xl border border-white/10 bg-slate-950/70 text-sm text-slate-200 file:mr-4 file:cursor-pointer file:border-0 file:bg-cyan-400/15 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-cyan-100 hover:file:bg-cyan-400/25 focus:outline-none focus:ring-4 focus:ring-cyan-300/20"
          />
          <p className="mt-2 text-xs text-slate-400">All uploaded rows will be analyzed after you click Analyze Orders.</p>
        </div>

        {selectedFile && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="shrink-0 text-emerald-300" size={20} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-emerald-100" title={selectedFile.name}>{selectedFile.name}</p>
                <p className="text-xs text-emerald-200">{fileSize(selectedFile.size)}</p>
              </div>
            </div>
            <CheckCircle2 className="text-emerald-300" size={20} />
          </div>
        )}

        {error && <p role="alert" className="mt-5 rounded-2xl bg-rose-500/10 p-4 text-sm font-medium text-rose-200">{error}</p>}

        {!selectedFile && (
          <div className="mt-6 grid gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 tm-glass p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-white">No file ready?</p>
                <p className="mt-1 text-sm text-slate-400">Download a complete sample CSV or test one order manually.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={downloadSampleCsv} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Download size={16} /> Download Sample CSV
                </button>
                <Link href="/predict?mode=chat" className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20">
                  <BrainCircuit size={16} /> Try AI chat prediction
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                [ShieldCheck, "Rule Engine", "Detects COD, unverified phone, incomplete address, high amount."],
                [BrainCircuit, "ML Model", "Predicts return probability using RandomForest."],
                [TrendingUp, "ProfitDoctor", "Finds low margin and cost issues."],
                [Warehouse, "StockMind", "Finds restock urgency and days left."],
              ].map(([Icon, title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <Icon className="text-cyan-300" size={20} />
                  <p className="mt-3 text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="button" onClick={handleUpload} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 disabled:cursor-wait disabled:opacity-60">
          {loading && <Loader2 className="animate-spin" size={17} />}
          {loading ? "Analyzing orders..." : "Analyze Orders"}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-white/10 tm-glass p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300"><CheckCircle2 size={20} /></span><h2 className="text-lg font-bold text-white">Analysis complete</h2></div>
          <p className="mt-1 text-sm text-slate-400">{result.uploaded_file || selectedFile?.name} analyzed successfully.</p>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${mlActive ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-500/10 text-amber-200"}`}>
            {mlActive ? "ML confidence active" : "Rule fallback"}
          </span>
          <p className={`mt-4 rounded-2xl border p-4 text-sm font-medium ${result.saved ? "border-emerald-200 bg-emerald-500/10 text-emerald-200" : "border-amber-300/20 bg-amber-500/10 text-amber-100"}`}>
            {result.saved
              ? "Analysis saved to your history."
              : "Analysis completed but was not saved because you are not logged in."}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-cyan-300/20 bg-blue-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Orders</p><p className="mt-1 text-2xl font-bold text-blue-100">{result.risk_summary.total_orders}</p></div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-rose-200">High Risk</p><p className="mt-1 text-2xl font-bold text-rose-100">{result.risk_summary.high_risk}</p></div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Net Profit</p><p className="mt-1 text-2xl font-bold text-emerald-100">৳{Number(result.profit_summary.net_profit).toLocaleString()}</p></div>
            <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-violet-200">Restock Needed</p><p className="mt-1 text-2xl font-bold text-violet-100">{result.stock_summary.restock_needed}</p></div>
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
          {result.smart_suggestions && (
            <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-blue-500/10 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-slate-900/70 p-2 text-cyan-300 shadow-sm"><Sparkles size={18} /></span>
                <div>
                  <h3 className="font-bold text-white">AI Smart Action Plan</h3>
                  <p className="mt-1 text-sm text-slate-300">Overall health: {result.smart_suggestions.overall_health}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl tm-glass p-4">
                  <p className="text-sm font-semibold text-white">Priority Actions</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {(result.smart_suggestions.priority_actions || []).map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl tm-glass p-4">
                  <p className="text-sm font-semibold text-white">Seller Next Steps</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {(result.smart_suggestions.seller_next_steps || []).map((item) => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b bg-white/[0.06] text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-3 py-3">Order ID</th><th>Product</th><th>Amount</th><th>Risk</th><th>Rule Score</th><th>ML</th><th>Final Score</th><th>Action</th></tr></thead>
              <tbody className="divide-y divide-white/10">
                {result.risk_orders.map((order) => (
                  <tr key={order.order_id} className="transition hover:bg-blue-500/10"><td className="px-3 py-4 font-semibold">{order.order_id}</td><td>{order.product_name}</td><td>৳{Number(order.amount).toLocaleString()}</td><td><RiskBadge level={order.risk_level} /></td><td>{Number(order.rule_score ?? (order.risk_score || 0)).toFixed(0)}</td><td>{order.ml_available ? `${Math.round(Number(order.ml_confidence || 0) * 100)}%` : "Fallback"}</td><td>{Number(order.final_risk_score ?? (order.risk_score || 0)).toFixed(0)}</td><td>{order.suggested_action}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
