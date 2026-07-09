import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { getDemoAnalysis } from "@/lib/api";
import { AlertTriangle, TrendingUp, WalletCards } from "lucide-react";

const money = (value) => `৳${Number(value || 0).toLocaleString()}`;

export default async function ProfitPage() {
  let data = null;
  let error = "";
  try { data = await getDemoAnalysis(100); } catch (requestError) { error = requestError.message; }
  const summary = data?.profit_summary || {};
  const products = data?.profit_products || [];
  const best = products[0];
  const lowMargin = products.find((product) => product.status === "Low Margin");
  const maxProfit = Math.max(...products.map((product) => Math.max(product.net_profit, 0)), 1);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-violet-50/50 pb-24 lg:pb-0"><Sidebar /><section className="lg:pl-64">
      <header className="border-b border-white/70 bg-white/70 px-6 py-6 backdrop-blur-xl"><h1 className="text-2xl font-bold tracking-tight text-slate-950">ProfitDoctor</h1><p className="mt-1 text-sm text-slate-500">Analyze sales, cost, shipping, profit margin, and low-profit products.</p></header>
      <div className="space-y-6 p-6">
        {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load profit analysis: {error}</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="Total Sales" value={money(summary.total_sales)} subtitle="Demo dataset" tone="blue" /><StatCard title="Total Cost" value={money(summary.total_cost)} subtitle="Product cost" tone="purple" /><StatCard title="Net Profit" value={money(summary.net_profit)} subtitle="After shipping" tone="green" /><StatCard title="Profit Margin" value={`${summary.profit_margin || 0}%`} subtitle="Overall margin" tone="blue" /></div>
        <div className="grid gap-6 xl:grid-cols-3">
          <ChartCard title="Profit Performance" subtitle="Top product profit overview"><div className="space-y-5">{products.slice(0, 5).map((product) => <div key={`${product.product_name}-${product.product_category}`}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{product.product_name}</span><span className="text-slate-500">{money(product.net_profit)}</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-green-500" style={{ width: `${Math.max((product.net_profit / maxProfit) * 100, 0)}%` }} /></div></div>)}{products.length === 0 && <p className="text-sm text-slate-500">No product data found.</p>}</div></ChartCard>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><WalletCards className="text-green-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Best Profit Product</h2><p className="mt-2 text-sm text-slate-500">{best ? `${best.product_name} has the highest net profit in this dataset.` : "No product data available."}</p><div className="mt-5 rounded-2xl bg-green-50 p-4"><p className="text-sm text-green-700">Profit</p><p className="mt-1 text-3xl font-bold text-green-800">{money(best?.net_profit)}</p></div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><AlertTriangle className="text-red-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Low Margin Alert</h2><p className="mt-2 text-sm text-slate-500">{lowMargin ? `${lowMargin.product_name} is below the 15% healthy-margin threshold.` : "No low-margin products found."}</p><div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-800">{lowMargin ? "Review pricing, product cost, or shipping cost." : "Margins currently look healthy."}</div></div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><TrendingUp className="text-blue-600" size={24} /><div><h2 className="text-lg font-bold text-slate-950">Product-wise Profit Table</h2><p className="mt-1 text-sm text-slate-500">Sales, cost, shipping, profit and margin breakdown.</p></div></div><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="py-3">Product</th><th>Sales</th><th>Cost</th><th>Shipping</th><th>Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody className="divide-y">{products.map((product) => <tr key={`${product.product_name}-${product.product_category}`}><td className="py-4 font-semibold text-slate-900">{product.product_name}</td><td>{money(product.total_sales)}</td><td>{money(product.total_cost)}</td><td>{money(product.total_shipping)}</td><td className="font-semibold text-green-700">{money(product.net_profit)}</td><td>{product.profit_margin}%</td><td><span className={product.status === "Healthy" ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700" : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"}>{product.status}</span></td></tr>)}</tbody></table>{products.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No product data found.</p>}</div></div>
      </div>
    </section></main>
  );
}
