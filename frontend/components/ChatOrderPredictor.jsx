"use client";

import { useState } from "react";
import RiskBadge from "@/components/RiskBadge";
import { predictOrderText } from "@/lib/api";
import { AlertTriangle, BrainCircuit, CheckCircle2, Loader2, Sparkles } from "lucide-react";

const examples = [
  {
    label: "High-risk COD",
    text: "COD order 8500 taka, new customer, phone verify na, address incomplete, distance 80km, previous return 1, ordered at 11pm",
  },
  {
    label: "Safe prepaid",
    text: "Prepaid order 1200 taka, returning customer, phone verified, full address, distance 8km, no previous return, ordered at 2pm",
  },
  {
    label: "Late night long-distance",
    text: "Cash on delivery order value 6200 tk, phone unverified, far delivery, late night, coupon used, new account",
  },
  {
    label: "Low info example",
    text: "COD 5000 taka new customer",
  },
];

const previewFields = [
  ["payment_type", "Payment"],
  ["amount", "Amount"],
  ["phone_verified", "Phone"],
  ["address_complete", "Address"],
  ["distance_km", "Distance"],
  ["previous_returns", "Previous Returns"],
  ["order_hour", "Order Hour"],
  ["customer_type", "Customer Type"],
];

const confidenceStyles = {
  high: "border-emerald-200 bg-emerald-500/10 text-emerald-200",
  medium: "border-amber-300/20 bg-amber-500/10 text-amber-200",
  low: "border-rose-200 bg-rose-500/10 text-rose-200",
};

function formatValue(field, value) {
  if (field === "amount") return `Tk ${Number(value || 0).toLocaleString()}`;
  if (field === "distance_km") return `${Number(value || 0).toLocaleString()} km`;
  if (field === "order_hour") return `${String(value).padStart(2, "0")}:00`;
  return String(value ?? "-");
}

export default function ChatOrderPredictor() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) {
      return;
    }
    if (!message.trim()) {
      setError("Enter order details before analyzing.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const prediction = await predictOrderText(message);
      setResult(prediction);
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function applyExample(text) {
    setMessage(text);
    setResult(null);
    setError("");
  }

  const order = result?.order;
  const parsedOrder = result?.parsed_order;
  const suggestions = result?.smart_suggestions;
  const confidence = result?.parser_confidence || "low";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 tm-glass p-6 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-slate-950 p-3 text-white">
            <BrainCircuit size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Conversational Order Risk Check</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Describe an order in your own words. TradeMind AI will parse it locally and score it with the rule engine + ML model.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => applyExample(example.text)}
              className="rounded-2xl border border-cyan-300/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
            >
              {example.label}
            </button>
          ))}
        </div>

        <label className="mt-6 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order text</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={8}
            placeholder="Example: COD order 8500 taka, new customer, phone verify na, address incomplete, distance 80km, previous return 1, ordered at 11pm"
            className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-medium leading-6 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/15"
          />
        </label>

        {error && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-200">
            <AlertTriangle className="mt-0.5 shrink-0" size={17} />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 disabled:cursor-wait disabled:opacity-60"
        >
          {loading && <Loader2 className="animate-spin" size={17} />}
          {loading ? "Analyzing..." : "Analyze Text"}
        </button>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} />
            <p className="text-sm leading-6 text-slate-300">
              No external AI API used. Text is parsed locally, then scored by the trained RandomForest model.
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            This result is generated from your text input only. Saved analysis data is not used.
          </p>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-white">Chat Prediction Result</h2>
          {!result && (
            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-blue-500/10 p-4">
              <p className="text-sm leading-6 text-blue-200">
                Try to include amount, payment type, phone/address status, distance, previous return, and order time.
              </p>
            </div>
          )}

          {result && parsedOrder && order && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {result.source === "chat_input" && (
                  <span className="inline-flex rounded-full border border-cyan-300/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-200">
                    Source: Chat input
                  </span>
                )}
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${confidenceStyles[confidence]}`}>
                  {confidence} parser confidence
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {previewFields.map(([field, label]) => (
                  <div key={field} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 truncate text-base font-bold text-white">{formatValue(field, parsedOrder[field])}</p>
                  </div>
                ))}
              </div>

              {result.missing_fields?.length > 0 && (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-amber-100">Missing fields: {result.missing_fields.join(", ")}</p>
                      <p className="mt-1 text-sm leading-6 text-amber-100">Prediction uses safe defaults for missing values.</p>
                    </div>
                  </div>
                </div>
              )}

              {result.parser_notes?.length > 0 && (
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-sm font-semibold text-white">Parser Notes</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {result.parser_notes.map((note) => (
                      <li key={note}>- {note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] p-4">
                <div>
                  <p className="text-xs text-slate-400">Risk Level</p>
                  <div className="mt-1">
                    <RiskBadge level={order.risk_level} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Final Score</p>
                  <p className="mt-1 text-2xl font-bold text-white">{Number(order.final_risk_score || 0).toFixed(0)}/100</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-500/10 p-4">
                  <p className="text-xs font-semibold text-blue-200">Rule Score</p>
                  <p className="mt-1 text-xl font-bold text-blue-100">{Number(order.rule_score || 0).toFixed(0)}/100</p>
                </div>
                <div className="rounded-2xl bg-violet-500/10 p-4">
                  <p className="text-xs font-semibold text-violet-200">ML Confidence</p>
                  <p className="mt-1 text-xl font-bold text-violet-100">
                    {order.ml_available ? `${Math.round(Number(order.ml_confidence || 0) * 100)}%` : "Fallback"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-sm font-semibold text-white">Reasons</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(order.reasons?.length ? order.reasons : ["No major rule risk detected"]).map((reason) => (
                    <span key={reason} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-slate-300">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-blue-500/10 p-4">
                <p className="text-sm font-semibold text-blue-100">Suggested Action</p>
                <p className="mt-1 text-sm leading-6 text-blue-200">{order.suggested_action}</p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} />
                  <p className="text-sm font-semibold">Seller Next Steps</p>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {(suggestions?.seller_next_steps || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
