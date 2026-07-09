import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { TrendingUp, AlertTriangle, WalletCards } from "lucide-react";

const products = [
  {
    name: "T-Shirt",
    sales: "৳40,000",
    cost: "৳25,000",
    shipping: "৳3,000",
    profit: "৳12,000",
    margin: "30%",
    status: "Healthy",
  },
  {
    name: "Headphone",
    sales: "৳70,000",
    cost: "৳55,000",
    shipping: "৳5,000",
    profit: "৳10,000",
    margin: "14%",
    status: "Low Margin",
  },
  {
    name: "Cosmetics",
    sales: "৳30,000",
    cost: "৳20,000",
    shipping: "৳2,000",
    profit: "৳8,000",
    margin: "26%",
    status: "Healthy",
  },
];

export default function ProfitPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />

      <section className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
          <h1 className="text-2xl font-bold text-slate-950">ProfitDoctor</h1>
          <p className="mt-1 text-sm text-slate-500">
            Analyze sales, cost, shipping, profit margin, and low-profit products.
          </p>
        </header>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Sales" value="৳185,000" subtitle="This dataset" tone="blue" />
            <StatCard title="Total Cost" value="৳120,000" subtitle="Product cost" tone="purple" />
            <StatCard title="Net Profit" value="৳42,500" subtitle="After shipping cost" tone="green" />
            <StatCard title="Profit Margin" value="28.3%" subtitle="Overall margin" tone="blue" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <ChartCard
              title="Profit Performance"
              subtitle="Product-wise profit overview"
            >
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">T-Shirt</span>
                    <span className="text-slate-500">৳12,000</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-[78%] rounded-full bg-green-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Headphone</span>
                    <span className="text-slate-500">৳10,000</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-[60%] rounded-full bg-yellow-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Cosmetics</span>
                    <span className="text-slate-500">৳8,000</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-[45%] rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </ChartCard>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <WalletCards className="text-green-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Best Profit Product</h2>
              <p className="mt-2 text-sm text-slate-500">
                T-Shirt gives the strongest margin and stable profit in this dataset.
              </p>
              <div className="mt-5 rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-green-700">Profit</p>
                <p className="mt-1 text-3xl font-bold text-green-800">৳12,000</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <AlertTriangle className="text-red-600" size={28} />
              <h2 className="mt-4 font-bold text-slate-950">Low Margin Alert</h2>
              <p className="mt-2 text-sm text-slate-500">
                Headphone has high sales but low profit margin due to high cost and shipping.
              </p>
              <div className="mt-5 rounded-2xl bg-red-50 p-4">
                <p className="text-sm text-red-700">Suggestion</p>
                <p className="mt-1 text-sm font-medium text-red-800">
                  Reduce shipping cost or increase price.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-blue-600" size={24} />
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Product-wise Profit Table
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sales, cost, shipping, profit and margin breakdown.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="py-3">Product</th>
                    <th>Sales</th>
                    <th>Cost</th>
                    <th>Shipping</th>
                    <th>Profit</th>
                    <th>Margin</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.name}>
                      <td className="py-4 font-semibold text-slate-900">
                        {product.name}
                      </td>
                      <td>{product.sales}</td>
                      <td>{product.cost}</td>
                      <td>{product.shipping}</td>
                      <td className="font-semibold text-green-700">
                        {product.profit}
                      </td>
                      <td>{product.margin}</td>
                      <td>
                        <span
                          className={
                            product.status === "Healthy"
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
                          }
                        >
                          {product.status}
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