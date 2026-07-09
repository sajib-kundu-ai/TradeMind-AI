import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { getDemoAnalysis } from "@/lib/api";
import { AlertTriangle, PackageCheck, TrendingDown } from "lucide-react";

export default async function StockPage() {
  let data = null;
  let error = "";
  try { data = await getDemoAnalysis(100); } catch (requestError) { error = requestError.message; }
  const summary = data?.stock_summary || {};
  const stocks = data?.stock_items || [];
  const healthy = stocks.filter((item) => item.status === "Healthy").sort((a, b) => b.days_left - a.days_left)[0];
  const critical = stocks.find((item) => item.status === "Critical") || stocks.find((item) => item.status === "Warning");
  const total = summary.total_products || 1;
  const percent = (value) => Math.round(((value || 0) / total) * 100);

  return (
    <main className="min-h-screen bg-slate-100"><Sidebar /><section className="lg:pl-72">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur"><h1 className="text-2xl font-bold text-slate-950">StockMind</h1><p className="mt-1 text-sm text-slate-500">Monitor stock levels, predict stock-out risk, and get restock suggestions.</p></header>
      <div className="space-y-6 p-6">
        {error && <p className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Could not load stock analysis: {error}</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="Total Products" value={summary.total_products || 0} subtitle="Tracked products" tone="blue" /><StatCard title="Critical Stock" value={summary.critical_stock || 0} subtitle="Immediate attention" tone="red" /><StatCard title="Healthy Stock" value={summary.healthy_stock || 0} subtitle="Stable products" tone="green" /><StatCard title="Restock Needed" value={summary.restock_needed || 0} subtitle="Critical + warning" tone="purple" /></div>
        <div className="grid gap-6 xl:grid-cols-3">
          <ChartCard title="Stock Health" subtitle="Current stock condition overview"><div className="space-y-5">{[["Healthy Stock", summary.healthy_stock, "bg-green-500"], ["Restock Soon", summary.warning_stock, "bg-yellow-500"], ["Critical", summary.critical_stock, "bg-red-500"]].map(([label, value, color]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{percent(value)}%</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${color}`} style={{ width: `${percent(value)}%` }} /></div></div>)}</div></ChartCard>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><PackageCheck className="text-green-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Best Stock Condition</h2><p className="mt-2 text-sm text-slate-500">{healthy ? `${healthy.product_name} has about ${healthy.days_left} days of stock left.` : "No healthy stock item found."}</p><div className="mt-5 rounded-2xl bg-green-50 p-4"><p className="text-sm text-green-700">Current Stock</p><p className="mt-1 text-3xl font-bold text-green-800">{healthy?.current_stock || 0} pcs</p></div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><AlertTriangle className="text-red-600" size={28} /><h2 className="mt-4 font-bold text-slate-950">Priority Alert</h2><p className="mt-2 text-sm text-slate-500">{critical ? `${critical.product_name} may run out in ${critical.days_left} days.` : "No urgent stock alerts."}</p><div className="mt-5 rounded-2xl bg-red-50 p-4"><p className="text-sm text-red-700">Suggested Restock</p><p className="mt-1 text-3xl font-bold text-red-800">{critical?.recommended_restock || 0} pcs</p></div></div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><TrendingDown className="text-blue-600" size={24} /><div><h2 className="text-lg font-bold text-slate-950">Stock Recommendation Table</h2><p className="mt-1 text-sm text-slate-500">Stock-out prediction based on current stock and average daily sales.</p></div></div><div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-slate-500"><tr><th className="py-3">Product</th><th>Current Stock</th><th>Daily Sales</th><th>Days Left</th><th>Suggestion</th><th>Status</th></tr></thead><tbody className="divide-y">{stocks.map((item) => <tr key={`${item.product_name}-${item.product_category}`}><td className="py-4 font-semibold text-slate-900">{item.product_name}</td><td>{item.current_stock} pcs</td><td>{Number(item.avg_daily_sales).toFixed(1)} pcs/day</td><td>{item.days_left === 999 ? "No sales" : `${item.days_left} days`}</td><td className="font-medium text-slate-900">{item.suggestion}</td><td><span className={item.status === "Healthy" ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700" : item.status === "Warning" ? "rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700" : "rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"}>{item.status}</span></td></tr>)}</tbody></table>{stocks.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No stock data found.</p>}</div></div>
      </div>
    </section></main>
  );
}
