import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import { FileDown, Info, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="tm-dark-app pb-24 lg:pb-0">
      <Sidebar />

      <section className="tm-app-content lg:pl-64">
        <header className="tm-app-header px-6 py-5">
          <h1 className="text-2xl font-bold text-white">Upload Orders</h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload seller order data and let TradeMind AI generate business insights.
          </p>
        </header>

        <div className="grid gap-6 p-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <UploadBox />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Info className="text-cyan-300" size={22} />
                <h2 className="font-bold text-white">Required Columns</h2>
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-300">
                <p>order_id</p>
                <p>product_name</p>
                <p>payment_type</p>
                <p>amount</p>
                <p>customer_type</p>
                <p>phone_verified</p>
                <p>address_complete</p>
                <p>distance_km</p>
                <p>previous_returns</p>
                <p>order_hour</p>
                <p>cost_price</p>
                <p>shipping_cost</p>
                <p>current_stock</p>
                <p>avg_daily_sales</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-sm">
              <h2 className="text-lg font-bold">What TradeMind AI analyzes</h2>
              <div className="mt-5 space-y-4">
                {[
                  [ShieldCheck, "ReturnGuard AI", "Risky order detection and verification actions."],
                  [TrendingUp, "ProfitDoctor", "Sales, cost, shipping, and margin analysis."],
                  [PackageCheck, "StockMind", "Stock-out forecasts and restock suggestions."],
                  [FileDown, "Reports", "Downloadable business insights for review."],
                ].map(([Icon, title, description]) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <Icon className="mt-0.5 shrink-0 text-blue-300" size={18} />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
