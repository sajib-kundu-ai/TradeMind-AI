"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import RiskBadge from "@/components/RiskBadge";
import ChatOrderPredictor from "@/components/ChatOrderPredictor";
import { predictOrder } from "@/lib/api";
import { BrainCircuit, Loader2, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";

const initialForm = {
  order_id: "",
  product_name: "",
  product_category: "Electronics",
  payment_type: "COD",
  shipping_speed: "Standard",
  amount: 5000,
  quantity: 1,
  customer_type: "New",
  phone_verified: "No",
  email_verified: "Yes",
  address_complete: "No",
  distance_km: 55,
  previous_orders: 0,
  previous_returns: 0,
  order_hour: 22,
  coupon_used: "Yes",
  account_age_days: 14,
  current_stock: 20,
  avg_daily_sales: 4,
  discount_amount: 250,
};

const fields = [
  ["order_id", "Order ID", "text"],
  ["product_name", "Product", "text"],
  ["product_category", "Category", "text"],
  ["amount", "Amount", "number"],
  ["quantity", "Quantity", "number"],
  ["payment_type", "Payment", "select", ["COD", "Prepaid"]],
  ["shipping_speed", "Shipping", "select", ["Standard", "Express", "Next-Day"]],
  ["customer_type", "Customer", "select", ["New", "Returning"]],
  ["phone_verified", "Phone", "select", ["Yes", "No"]],
  ["email_verified", "Email", "select", ["Yes", "No"]],
  ["address_complete", "Address", "select", ["Yes", "No"]],
  ["distance_km", "Distance km", "number"],
  ["previous_orders", "Previous orders", "number"],
  ["previous_returns", "Previous returns", "number"],
  ["order_hour", "Order hour", "number"],
  ["coupon_used", "Coupon", "select", ["Yes", "No"]],
  ["account_age_days", "Account age", "number"],
  ["current_stock", "Current stock", "number"],
  ["avg_daily_sales", "Avg daily sales", "number"],
  ["discount_amount", "Discount", "number"],
];

const sampleOrders = {
  highRisk: {
    order_id: "MANUAL-HIGH-001",
    product_name: "Premium Smart Watch",
    product_category: "Electronics",
    payment_type: "COD",
    shipping_speed: "Express",
    amount: 8500,
    quantity: 1,
    customer_type: "New",
    phone_verified: "No",
    email_verified: "No",
    address_complete: "No",
    distance_km: 82,
    previous_orders: 0,
    previous_returns: 1,
    order_hour: 23,
    coupon_used: "Yes",
    account_age_days: 6,
    current_stock: 8,
    avg_daily_sales: 3,
    discount_amount: 500,
  },
  safe: {
    order_id: "MANUAL-SAFE-001",
    product_name: "Cotton T-Shirt",
    product_category: "Fashion",
    payment_type: "Prepaid",
    shipping_speed: "Standard",
    amount: 1200,
    quantity: 2,
    customer_type: "Returning",
    phone_verified: "Yes",
    email_verified: "Yes",
    address_complete: "Yes",
    distance_km: 8,
    previous_orders: 6,
    previous_returns: 0,
    order_hour: 14,
    coupon_used: "No",
    account_age_days: 220,
    current_stock: 70,
    avg_daily_sales: 5,
    discount_amount: 0,
  },
};

function money(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function PredictPage() {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "form";
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "chat" ? "chat" : "form";
  });
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateMode(nextMode) {
    setMode(nextMode);
    const nextUrl = nextMode === "chat" ? "/predict?mode=chat" : "/predict";
    window.history.replaceState(null, "", nextUrl);
  }

  function updateField(name, value, type) {
    setForm((current) => ({
      ...current,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const prediction = await predictOrder(form);
      setResult(prediction);
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const order = result?.order;
  const suggestions = result?.smart_suggestions;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />
      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">AI Predict</h1>
              <p className="mt-1 text-sm text-slate-500">Use structured form input or conversational text input for order risk checks.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"><BrainCircuit size={14} /> Rule engine + ML</span>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => updateMode("form")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "form" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Form Mode
            </button>
            <button
              type="button"
              onClick={() => updateMode("chat")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "chat" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Chat Mode
            </button>
          </div>

          {mode === "chat" && <ChatOrderPredictor />}

          {mode === "form" && (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-slate-950 p-3 text-white"><Sparkles size={20} /></span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Order Inputs</h2>
                <p className="mt-1 text-sm text-slate-500">Use this when you want to check one order before shipping without uploading a CSV.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setForm(sampleOrders.highRisk); setResult(null); }} className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                High-risk COD example
              </button>
              <button type="button" onClick={() => { setForm(sampleOrders.safe); setResult(null); }} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                Safe prepaid example
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {fields.map(([name, label, type, options]) => (
                <label key={name} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
                  {type === "select" ? (
                    <select value={form[name]} onChange={(event) => updateField(name, event.target.value, type)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                      {options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={form[name]} onChange={(event) => updateField(name, event.target.value, type)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
                  )}
                </label>
              ))}
            </div>

            {error && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 disabled:cursor-wait disabled:opacity-60">
              {loading && <Loader2 className="animate-spin" size={17} />}
              {loading ? "Predicting..." : "Predict Risk"}
            </button>
            </form>

            <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Prediction Result</h2>
              {!order && <p className="mt-3 text-sm leading-6 text-slate-500">Submit an order to see the blended risk score, reasons, and action plan.</p>}
              {order && (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <p className="text-xs text-slate-500">Risk Level</p>
                      <div className="mt-1"><RiskBadge level={order.risk_level} /></div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Final Score</p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">{Number(order.final_risk_score || 0).toFixed(0)}/100</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-semibold text-blue-700">Rule Score</p><p className="mt-1 text-xl font-bold text-blue-950">{Number(order.rule_score || 0).toFixed(0)}/100</p></div>
                    <div className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-semibold text-violet-700">ML Confidence</p><p className="mt-1 text-xl font-bold text-violet-950">{order.ml_available ? `${Math.round(Number(order.ml_confidence || 0) * 100)}%` : "Fallback"}</p></div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-950">Reasons</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(order.reasons?.length ? order.reasons : ["No major rule risk detected"]).map((reason) => <span key={reason} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{reason}</span>)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-950">Suggested Action</p>
                    <p className="mt-1 text-sm leading-6 text-blue-700">{order.suggested_action}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 text-white">
                    <p className="text-sm font-semibold">Seller Next Steps</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      {(suggestions?.seller_next_steps || []).map((item) => <li key={item}>- {item}</li>)}
                    </ul>
                  </div>

                  <p className="text-xs text-slate-500">Order amount: {money(order.amount)}. ML model status: {order.ml_available ? "available" : "rule fallback"}.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                      <UploadCloud size={17} /> Upload bulk CSV
                    </Link>
                    <Link href="/returnguard" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      <ShieldCheck size={17} /> View ReturnGuard queue
                    </Link>
                  </div>
                </div>
              )}
            </div>
            </aside>
          </div>
          )}
        </div>
      </section>
    </main>
  );
}
