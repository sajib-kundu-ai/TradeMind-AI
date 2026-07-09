"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const protectedPaths = [
  "/dashboard",
  "/upload",
  "/returnguard",
  "/profit",
  "/stock",
  "/reports",
];

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const hasToken =
    hydrated && Boolean(window.localStorage.getItem("trademind_token"));

  useEffect(() => {
    if (isProtected && hydrated && !hasToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasToken, hydrated, isProtected, pathname, router]);

  if (isProtected && !hasToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070816] text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl backdrop-blur">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" />
          <p className="text-sm text-slate-300">Checking your session…</p>
        </div>
      </main>
    );
  }

  return children;
}
