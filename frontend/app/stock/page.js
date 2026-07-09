import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { PackageCheck, AlertTriangle, TrendingDown } from "lucide-react";

const stocks = [
  {
    product: "Headphone",
    currentStock: 10,
    dailySales: 2,
    daysLeft: 5,
    suggestion: "Restock soon",
    status: "Warning",
  },
  {
    product: "Cosmetics",
    currentStock: 12,
    dailySales: 3,
    daysLeft: 4,
    suggestion: "Restock needed",
    status: "Critical",
  },
  {
    product: "T-Shirt",
    currentStock: 40,
    dailySales: 5,
    daysLeft: 8,
    suggestion: "Stock okay",
    status: "Healthy",
  },
];

export default function StockPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />

      <section className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-950">StockMind</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor stock levels, predict stock-out risk, and get restock suggestions.
          </p>
        </header>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Products" value="24" subtitle="Tracked products" tone="blue" />
            <StatCard title="Low Stock" value="4" subtitle="Need attention" tone="red" />
            <StatCard title="Fast Moving" value="7" subtitle="High demand items" tone="green" />
            <StatCard title="Restock Needed" value="3" subtitle="Within 5 days" tone="purple" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <ChartCard
              title="Stock Health"
              subtitle="Current stock condition overview"
            >
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Healthy Stock</span>
                    <span className="text-slate-500">65%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-[65%] rounded-full bg-green-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Restock Soon</span>
                    <span className="text-slate-500">25%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-[25%] rounded-full bg-yellow-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Critical</span>
                    <span className="text-slate-500">10%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-[10%] rounded-full bg-red-500" />
                  </div>
                </div>
              </div>
            </ChartCard>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <PackageCheck className="text-green-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Best Stock Condition</h2>
              <p className="mt-2 text-sm text-slate-500">
                T-Shirt stock is healthy and can continue for around 8 days.
              </p>
              <div className="mt-5 rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-green-700">Current Stock</p>
                <p className="mt-1 text-3xl font-bold text-green-800">40 pcs</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AlertTriangle className="text-red-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Critical Alert</h2>
              <p className="mt-2 text-sm text-slate-500">
                Cosmetics may finish in 4 days. Restock is needed immediately.
              </p>
              <div className="mt-5 rounded-2xl bg-red-50 p-4">
                <p className="text-sm text-red-700">Suggested Restock</p>
                <p className="mt-1 text-3xl font-bold text-red-800">42 pcs</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingDown className="text-blue-600" size={24} />
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Stock Recommendation Table
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stock-out prediction based on current stock and average daily sales.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="py-3">Product</th>
                    <th>Current Stock</th>
                    <th>Daily Sales</th>
                    <th>Days Left</th>
                    <th>Suggestion</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {stocks.map((item) => (
                    <tr key={item.product}>
                      <td className="py-4 font-semibold text-slate-900">
                        {item.product}
                      </td>
                      <td>{item.currentStock} pcs</td>
                      <td>{item.dailySales} pcs/day</td>
                      <td>{item.daysLeft} days</td>
                      <td className="font-medium text-slate-900">
                        {item.suggestion}
                      </td>
                      <td>
                        <span
                          className={
                            item.status === "Healthy"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                              : item.status === "Warning"
                              ? "rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                          }
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}