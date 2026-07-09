"use client";

import { requestOtp, verifyOtp } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function safeDestination(value) {
  return value?.startsWith("/") && !value.startsWith("//") && !value.startsWith("/login")
    ? value
    : "/dashboard";
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeDestination(searchParams.get("next"));
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (window.localStorage.getItem("trademind_token")) {
      router.replace(destination);
    }
  }, [destination, router]);

  async function handleRequestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await requestOtp(email.trim());
      setStep("otp");
      setSuccess("OTP sent successfully. Please check your email.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp(email.trim(), otp);
      window.localStorage.setItem("trademind_token", data.access_token);
      router.replace(destination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    setStep("email");
    setOtp("");
    setError("");
    setSuccess("");
  }

  const features = [
    [ShieldCheck, "ReturnGuard AI", "Identify risky orders before shipping."],
    [TrendingUp, "ProfitDoctor", "Understand margin and product performance."],
    [PackageCheck, "StockMind", "Stay ahead of low-stock situations."],
    [LockKeyhole, "Secure OTP login", "Passwordless access protected by a one-time code."],
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070816] px-5 py-6 text-white sm:px-8 lg:flex lg:items-center lg:py-10">
      <div className="pointer-events-none absolute -left-40 top-[-220px] h-[620px] w-[620px] rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-260px] right-[-100px] h-[620px] w-[620px] rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_35px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[0.94fr_1.06fr]">
        <section className="p-7 sm:p-10 lg:p-12">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft size={16} /> Back to home</Link>

          <div className="mb-9 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 font-bold shadow-lg shadow-blue-500/25">T</div>
            <div><h1 className="text-xl font-bold tracking-tight">TradeMind AI</h1><p className="text-xs text-slate-400">by Lossless Labs</p></div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200"><Sparkles size={14} /> Secure workspace access</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{step === "email" ? "Welcome back" : "Check your inbox"}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{step === "email" ? "Sign in without a password. We’ll send a secure one-time code to your email." : <>Enter the six-digit code sent to <span className="font-semibold text-slate-200">{email}</span>.</>}</p>

          {success && <p role="status" className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-200"><CheckCircle2 className="mt-0.5 shrink-0" size={17} />{success}</p>}
          {error && <p role="alert" className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3.5 text-sm text-rose-200">{error}</p>}

          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="mt-7 space-y-5">
              <div><label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">Email address</label><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-blue-400/70 focus-within:ring-4 focus-within:ring-blue-500/10"><Mail size={18} className="text-slate-500" /><input id="email" type="email" required autoFocus autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-600" /></div></div>
              <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 font-semibold shadow-xl shadow-blue-950/40 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Sending secure code…" : "Send OTP"}{!loading && <ArrowRight className="transition group-hover:translate-x-1" size={18} />}</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-7 space-y-5">
              <div><label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="otp">One-time code</label><div className="rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-violet-400/70 focus-within:ring-4 focus-within:ring-violet-500/10"><input id="otp" type="text" required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="••••••" aria-describedby="otp-help" className="w-full bg-transparent py-4 text-center text-2xl font-bold tracking-[0.65em] outline-none placeholder:tracking-[0.45em] placeholder:text-slate-600" /></div><p id="otp-help" className="mt-2 text-xs text-slate-500">The code expires shortly and can only be used once.</p></div>
              <button disabled={loading || otp.length !== 6} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 font-semibold shadow-xl shadow-blue-950/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Verifying code…" : "Verify and continue"}</button>
              <button type="button" onClick={changeEmail} className="w-full rounded-xl py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">Change email</button>
            </form>
          )}
        </section>

        <aside className="relative hidden overflow-hidden border-l border-white/10 bg-gradient-to-br from-blue-600/15 via-violet-600/10 to-transparent p-12 lg:flex lg:flex-col lg:justify-center">
          <div className="absolute right-[-80px] top-[-60px] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">One intelligent workspace</p><h3 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight">Make every seller decision with clarity.</h3><p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">Risk, profitability, and inventory intelligence designed for growing online businesses.</p>
            <div className="mt-9 grid gap-3">{features.map(([Icon, title, description]) => <div key={title} className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-white/[0.08]"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300"><Icon size={21} /></span><div><p className="font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{description}</p></div></div>)}</div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#070816]" />}><LoginContent /></Suspense>;
}
