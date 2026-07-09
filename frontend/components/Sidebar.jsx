import Link from "next/link";
import {
  BarChart3,
  Upload,
  ShieldCheck,
  WalletCards,
  PackageCheck,
  FileDown,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Upload Orders", href: "/upload", icon: Upload },
  { name: "ReturnGuard AI", href: "/returnguard", icon: ShieldCheck },
  { name: "ProfitDoctor", href: "/profit", icon: WalletCards },
  { name: "StockMind", href: "/stock", icon: PackageCheck },
  { name: "Reports", href: "/reports", icon: FileDown },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-[#070816] px-5 py-6 text-white lg:block">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold shadow-lg shadow-blue-500/20">
          T
        </div>
        <div>
          <h1 className="text-xl font-bold">TradeMind AI</h1>
          <p className="text-xs text-slate-400">by Lossless Labs</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-5 right-5 rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold">AI in Entrepreneurship</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Order risk, profit analytics and stock intelligence in one dashboard.
        </p>
      </div>
    </aside>
  );
}