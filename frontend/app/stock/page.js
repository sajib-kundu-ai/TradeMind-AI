"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import StockMindClient from "@/components/StockMindClient";
import { getLatestStockAnalysis, uploadStockAnalysis } from "@/lib/api";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const sampleRows = [
  [
    "product_name",
    "product_category",
    "current_stock",
    "avg_daily_sales",
    "cost_price",
    "selling_price",
    "reorder_level",
    "lead_time_days",
    "supplier_name",
  ],
  ["Bluetooth Speaker", "Electronics", "12", "2", "3500", "5200", "10", "5", "Local Supplier"],
  ["T-Shirt", "Fashion", "80", "6", "450", "900", "20", "4", "Dhaka Supplier"],
  ["Smart Watch", "Electronics", "6", "2", "3200", "6500", "8", "7", "Import Supplier"],
];

function getStoredUserEmail() {
  if (typeof window === "undefined") return "";
  return (window.localStorage.getItem("trademind_user_email") || "").trim().toLowerCase();
}

function getStockStorageKey() {
  const email = getStoredUserEmail();
  return email ? `trademind_stock_analysis_${email}` : "";
}

function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("trademind_token") || "";
}

function readStoredStockAnalysis() {
  if (typeof window === "undefined") return null;
  const key = getStockStorageKey();
  if (!key) return null;

  try {
    return JSON.parse(window.localStorage.getItem(key) || "null");
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function saveStoredStockAnalysis(analysis) {
  const key = getStockStorageKey();
  if (key && analysis) {
    window.localStorage.setItem(key, JSON.stringify(analysis));
  }
}

function clearStoredStockAnalysis() {
  const key = getStockStorageKey();
  if (key) {
    window.localStorage.removeItem(key);
  }
}

function downloadSampleCsv() {
  const csv = sampleRows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stockmind-sample-stock.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function isSupportedStockFile(file) {
  return /\.(csv|xlsx)$/i.test(file?.name || "");
}

function validateStockFile(file) {
  if (!file) {
    return "Choose a CSV or XLSX stock file first.";
  }

  if (!isSupportedStockFile(file)) {
    return "Only CSV and Excel .xlsx stock files are supported.";
  }

  if (file.size === 0) {
    return "Selected stock file is empty. Choose a CSV or XLSX file with stock data.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "Stock file is too large. Please upload a CSV/XLSX file under 10 MB.";
  }

  return "";
}

function MergeStatsSummary({ stats }) {
  if (!stats) return null;

  const items = [
    ["Previous products", stats.previous_product_count],
    ["Added", stats.added_products],
    ["Updated", stats.updated_products],
    ["Final products", stats.final_product_count],
  ];

  return (
    <div className="grid gap-3 rounded-2xl border border-cyan-300/20 bg-blue-500/10 p-4 text-sm sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-medium text-blue-200">{label}</p>
          <p className="mt-1 text-lg font-bold text-white">{value ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

function StockUploadSection({
  title,
  subtitle,
  buttonLabel,
  fileInputRef,
  selectedFile,
  uploading,
  onUpload,
  onSelectFile,
}) {
  return (
    <section className="rounded-2xl border border-white/10 tm-glass p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
        </div>
        <button type="button" onClick={downloadSampleCsv} className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
          <Download size={17} />
          Sample CSV
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={onSelectFile}
      />
      <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-cyan-300/20 bg-blue-500/10 p-5 text-left transition hover:border-blue-300 hover:bg-blue-500/10">
        <span>
          <span className="block text-sm font-bold text-slate-100">{selectedFile ? selectedFile.name : "Choose stock CSV/XLSX"}</span>
          <span className="mt-1 block text-xs text-slate-400">Required: product_name, current_stock, avg_daily_sales</span>
        </span>
        <Upload className="shrink-0 text-blue-200" size={22} />
      </button>

      <button type="button" onClick={onUpload} disabled={uploading || !selectedFile} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl tm-button-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        <FileSpreadsheet size={17} />
        {uploading ? "Analyzing Stock..." : buttonLabel}
      </button>
    </section>
  );
}

export default function StockPage() {
  const fileInputRef = useRef(null);
  const [data, setData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataSource, setDataSource] = useState("No stock data");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadLatestStock() {
    setLoading(true);
    setError("");
    setSuccess("");
    const token = getToken();
    if (!token) {
      const stored = readStoredStockAnalysis();
      setData(stored);
      setDataSource(stored ? "Uploaded stock analysis" : "No stock data");
      setLoading(false);
      return;
    }

    try {
      const latest = await getLatestStockAnalysis(token);
      setData(latest);
      setDataSource(latest.merge_stats ? "Merged stock analysis" : "Latest stock analysis");
      saveStoredStockAnalysis(latest);
    } catch (requestError) {
      if (requestError.status === 404 || requestError.message.includes("No stock data found")) {
        setData(null);
        setDataSource("No stock data");
        clearStoredStockAnalysis();
      } else {
        const stored = readStoredStockAnalysis();
        if (stored) {
          setData(stored);
          setDataSource("Uploaded stock analysis");
        } else {
          setData(null);
          setDataSource("No stock data");
        }
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(loadLatestStock);
  }, []);

  async function handleUpload() {
    if (uploading) {
      return;
    }

    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }

    const validationError = validateStockFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const analysis = await uploadStockAnalysis(selectedFile, getToken(), { merge: true });
      setData(analysis);
      setDataSource(analysis.merge_stats ? "Merged stock analysis" : analysis.saved ? "Latest stock analysis" : "Uploaded stock analysis");
      saveStoredStockAnalysis(analysis);
      setSuccess(analysis.merge_stats ? "Stock data merged and recalculated." : analysis.saved ? "Stock data analyzed and saved" : "Stock data analyzed");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  const summary = data?.stock_summary || {};
  const stocks = data?.stock_items || [];
  const mergeStats = data?.merge_stats || null;
  const hasStockData = Boolean(data && stocks.length);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = file ? validateStockFile(file) : "";
    setSelectedFile(validationError ? null : file);
    setError(validationError);
    setSuccess("");
    if (validationError && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="tm-dark-app pb-24 lg:pb-0">
      <Sidebar />
      <section className="tm-app-content lg:pl-64">
        <header className="tm-app-header px-6 py-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">StockMind</h1>
              <p className="mt-1 text-sm text-slate-400">Monitor uploaded inventory, sales velocity, and restock urgency.</p>
            </div>
            <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">{dataSource}</span>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {error && <p className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</p>}
          {success && <p className="rounded-2xl border border-emerald-200 bg-emerald-500/10 p-5 text-sm text-emerald-200">{success}</p>}

          {loading && <p className="rounded-2xl border border-white/10 tm-glass p-5 text-sm text-slate-400">Loading stock analysis...</p>}

          {!loading && !hasStockData && (
            <section className="mx-auto max-w-3xl">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200">
                  <FileSpreadsheet size={26} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">Upload stock data</h2>
                <p className="mt-2 text-sm text-slate-400">Upload your product stock and sales CSV/XLSX to analyze StockMind.</p>
              </div>

              <div className="mt-6">
                <StockUploadSection
                  title="Latest stock analysis"
                  subtitle="Start by uploading stock data for your products. StockMind data stays separate from order analysis."
                  buttonLabel="Analyze Stock"
                  fileInputRef={fileInputRef}
                  selectedFile={selectedFile}
                  uploading={uploading}
                  onUpload={handleUpload}
                  onSelectFile={handleFileChange}
                />
              </div>
            </section>
          )}

          {hasStockData && (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Products" value={summary.total_products || 0} subtitle={dataSource} tone="blue" />
                <StatCard title="Critical Stock" value={summary.critical_stock || 0} subtitle="Immediate attention" tone="red" />
                <StatCard title="Healthy Stock" value={summary.healthy_stock || 0} subtitle="Stable products" tone="green" />
                <StatCard title="Restock Needed" value={summary.restock_needed || 0} subtitle="Products to reorder" tone="purple" />
              </div>
              <MergeStatsSummary stats={mergeStats} />
              <StockUploadSection
                title="Upload More Stock Data"
                subtitle="Add new products or update existing stock values. Duplicate products will be updated."
                buttonLabel="Analyze & Merge Stock"
                fileInputRef={fileInputRef}
                selectedFile={selectedFile}
                uploading={uploading}
                onUpload={handleUpload}
                onSelectFile={handleFileChange}
              />
              <StockMindClient summary={summary} stocks={stocks} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
