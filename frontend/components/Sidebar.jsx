"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  BarChart3,
  Upload,
  ShieldCheck,
  WalletCards,
  PackageCheck,
  FileDown,
  History,
  LogOut,
  User,
} from "lucide-react";

const userEmailKey = "trademind_user_email";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Upload Orders", href: "/upload", icon: Upload },
  { name: "ReturnGuard AI", href: "/returnguard", icon: ShieldCheck },
  { name: "ProfitDoctor", href: "/profit", icon: WalletCards },
  { name: "StockMind", href: "/stock", icon: PackageCheck },
  { name: "Reports", href: "/reports", icon: FileDown },
  { name: "History", href: "/history", icon: History },
];

function subscribeToUserChanges(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("trademind:auth-changed", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("trademind:auth-changed", callback);
  };
}

function getUserEmailSnapshot() {
  return window.localStorage.getItem(userEmailKey) || "Signed in user";
}

function getServerUserEmailSnapshot() {
  return "Signed in user";
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const userEmail = useSyncExternalStore(
    subscribeToUserChanges,
    getUserEmailSnapshot,
    getServerUserEmailSnapshot
  );

  function handleLogout() {
    window.localStorage.removeItem("trademind_token");
    window.localStorage.removeItem(userEmailKey);
    window.dispatchEvent(new Event("trademind:auth-changed"));
    router.replace("/login");
  }

  return (
    <>
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 overflow-hidden border-r border-white/10 bg-[#070816] px-4 py-5 text-white shadow-2xl lg:block">
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold shadow-lg shadow-blue-500/20">
          T
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">TradeMind AI</h1>
          <p className="text-xs text-slate-400">by Lossless Labs</p>
        </div>
      </div>

      <nav className="relative space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium transition ${
                active
                  ? "border-blue-400/20 bg-gradient-to-r from-blue-500/20 to-purple-500/15 text-white shadow-lg shadow-blue-950/20"
                  : "border-transparent text-slate-400 hover:border-white/5 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span className={`rounded-xl p-1.5 ${active ? "bg-blue-500/20 text-blue-300" : "bg-white/5 group-hover:text-blue-300"}`}><Icon size={17} /></span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 space-y-3 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 backdrop-blur">
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <User size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">User</p>
            <p className="truncate text-sm font-medium text-slate-200" title={userEmail}>
              {userEmail}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>

    <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#0b0d1d]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl lg:hidden">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return <Link key={item.href} href={item.href} aria-label={item.name} className={`flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition ${active ? "bg-blue-500/20 text-blue-300" : "text-slate-400"}`}><Icon size={18} /><span className="max-w-14 truncate">{item.name.split(" ")[0]}</span></Link>;
      })}
      <button type="button" onClick={handleLogout} aria-label="Logout" className="flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] text-slate-400"><LogOut size={18} /><span>Logout</span></button>
    </nav>
    </>
  );
}
