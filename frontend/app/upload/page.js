import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import { Download, Info } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />

      <section className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
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
              <Download size={24} />

              <h2 className="mt-4 text-lg font-bold">Sample CSV</h2>

              <p className="mt-2 text-sm text-slate-400">
                Use our sample dataset to test ReturnGuard AI quickly.
              </p>

              <a href="http://127.0.0.1:8000/api/sample-orders" className="mt-5 block w-full rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                Download Sample
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
