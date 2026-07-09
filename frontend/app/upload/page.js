import Sidebar from "@/components/Sidebar";
import UploadBox from "@/components/UploadBox";
import { Download, Info, TableProperties } from "lucide-react";

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

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <TableProperties className="text-purple-600" size={22} />
                <h2 className="font-bold text-slate-950">Data Preview</h2>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b text-slate-500">
                    <tr>
                      <th className="py-3">Order ID</th>
                      <th>Product</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Phone</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    <tr>
                      <td className="py-4 font-medium">ORD-1024</td>
                      <td>Headphone</td>
                      <td>COD</td>
                      <td>৳7,500</td>
                      <td>Not Verified</td>
                    </tr>

                    <tr>
                      <td className="py-4 font-medium">ORD-1031</td>
                      <td>Cosmetics</td>
                      <td>COD</td>
                      <td>৳2,200</td>
                      <td>Verified</td>
                    </tr>

                    <tr>
                      <td className="py-4 font-medium">ORD-1042</td>
                      <td>T-Shirt</td>
                      <td>Prepaid</td>
                      <td>৳1,200</td>
                      <td>Verified</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <Download size={24} />

              <h2 className="mt-4 text-lg font-bold">Sample CSV</h2>

              <p className="mt-2 text-sm text-slate-400">
                Use our sample dataset to test ReturnGuard AI quickly.
              </p>

              <button className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                Download Sample
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}