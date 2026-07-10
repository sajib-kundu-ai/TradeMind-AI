import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import { FileDown, Info, PackageCheck, ShieldCheck, TrendingUp } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0">
      <Sidebar />

      <section className="lg:pl-64">
        <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-slate-950">Upload Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload seller order data and let TradeMind AI generate business insights.
          </p>
        </header>

        <div className="grid gap-6 p-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <UploadBox />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Info className="text-blue-600" size={22} />
                <h2 className="font-bold text-slate-950">Required Columns</h2>
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
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

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
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
