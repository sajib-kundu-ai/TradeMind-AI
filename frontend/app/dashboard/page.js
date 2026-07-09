import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import RiskBadge from "@/components/RiskBadge";
import { getDemoAnalysis } from "@/lib/api";

function money(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

async function loadDashboardData() {
  try {
    return await getDemoAnalysis(8);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await loadDashboardData();

  const risk = data?.risk_summary || {};
  const profit = data?.profit_summary || {};
  const stock = data?.stock_summary || {};
  const orders = data?.risk_orders || [];
  const riskPercent = (value) =>
    risk.total_orders ? Math.round(((value || 0) / risk.total_orders) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-100">
      <Sidebar />

      <section className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Live business overview from ReturnGuard, ProfitDoctor and StockMind.
              </p>
            </div>

            <a
              href="/upload"
              className="w-fit rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Analyze New Orders
            </a>
          </div>
        </header>

        <div className="space-y-6 p-6">
          {!data && (
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-sm font-medium text-yellow-800">
              Backend API চালু নেই। Real data দেখতে backend server run করো।
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Orders"
              value={risk.total_orders || 0}
              subtitle="Analyzed orders"
              tone="blue"
            />
            <StatCard
              title="High Risk Orders"
              value={risk.high_risk || 0}
              subtitle="Need verification"
              tone="red"
            />
            <StatCard
              title="Net Profit"
              value={money(profit.net_profit)}
              subtitle={`${profit.profit_margin || 0}% margin`}
              tone="green"
            />
            <StatCard
              title="Restock Needed"
              value={stock.restock_needed || 0}
              subtitle="Critical + warning"
              tone="purple"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-semibold text-slate-950">Risk Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Order risk distribution from ReturnGuard AI.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Low Risk</span>
                    <span className="text-slate-500">{risk.low_risk || 0} orders</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-green-500" style={{ width: `${riskPercent(risk.low_risk)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Medium Risk</span>
                    <span className="text-slate-500">{risk.medium_risk || 0} orders</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-yellow-500" style={{ width: `${riskPercent(risk.medium_risk)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">High Risk</span>
                    <span className="text-slate-500">{risk.high_risk || 0} orders</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-red-500" style={{ width: `${riskPercent(risk.high_risk)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Stock Alerts</h2>
              <p className="mt-1 text-sm text-slate-500">Products needing attention.</p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">Critical Stock</p>
                  <p className="mt-1 text-xs text-red-600">
                    {stock.critical_stock || 0} products need immediate restock
                  </p>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-yellow-700">Warning Stock</p>
                  <p className="mt-1 text-xs text-yellow-600">
                    {stock.warning_stock || 0} products may finish soon
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">Healthy Stock</p>
                  <p className="mt-1 text-xs text-green-600">
                    {stock.healthy_stock || 0} products are stable
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Recent Risky Orders</h2>
            <p className="mt-1 text-sm text-slate-500">
              Orders that need confirmation before shipping.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="py-3">Order ID</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Risk</th>
                    <th>Score</th>
                    <th>Suggested Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.order_id}>
                      <td className="py-4 font-semibold text-slate-900">
                        {order.order_id}
                      </td>
                      <td>{order.product_name}</td>
                      <td>{money(order.amount)}</td>
                      <td>
                        <RiskBadge level={order.risk_level} />
                      </td>
                      <td>{order.risk_score}/100</td>
                      <td className="font-medium text-slate-900">
                        {order.suggested_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  No data found.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
