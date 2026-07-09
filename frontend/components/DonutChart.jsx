function money(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

export default function DonutChart({ profit = 0, cost = 0, shipping = 0 }) {
  const safeProfit = Math.max(Number(profit || 0), 0);
  const safeCost = Math.max(Number(cost || 0), 0);
  const safeShipping = Math.max(Number(shipping || 0), 0);

  const total = safeProfit + safeCost + safeShipping || 1;

  const profitPercent = Math.round((safeProfit / total) * 100);
  const costPercent = Math.round((safeCost / total) * 100);
  const shippingPercent = 100 - profitPercent - costPercent;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Sales Breakdown</h2>
      <p className="mt-1 text-sm text-slate-500">
        Cost, shipping and net profit share.
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 md:flex-row">
        <div
          className="relative h-48 w-48 rounded-full"
          style={{
            background: `conic-gradient(#22c55e 0% ${profitPercent}%, #8b5cf6 ${profitPercent}% ${
              profitPercent + costPercent
            }%, #f59e0b ${profitPercent + costPercent}% 100%)`,
          }}
        >
          <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white">
            <p className="text-sm text-slate-500">Profit</p>
            <p className="text-2xl font-bold text-slate-950">{profitPercent}%</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
            <span className="text-sm font-semibold text-green-700">Net Profit</span>
            <span className="font-bold text-green-800">{money(safeProfit)}</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-purple-50 p-4">
            <span className="text-sm font-semibold text-purple-700">Product Cost</span>
            <span className="font-bold text-purple-800">{money(safeCost)}</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-yellow-50 p-4">
            <span className="text-sm font-semibold text-yellow-700">Shipping Cost</span>
            <span className="font-bold text-yellow-800">{money(safeShipping)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}