import RiskBadge from "./RiskBadge";

export default function RiskTable({ orders = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-950">
          ReturnGuard Risk Analysis
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          AI-powered order risk scoring with explainable reason tags.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-3">Order ID</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Risk</th>
              <th>Score</th>
              <th>Reasons</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.order_id}>
                <td className="py-4 font-semibold text-slate-900">
                  {order.order_id}
                </td>
                <td>{order.product_name}</td>
                <td>৳{Number(order.amount || 0).toLocaleString()}</td>
                <td>
                  <RiskBadge level={order.risk_level} />
                </td>
                <td className="font-semibold">{order.risk_score}/100</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {order.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="font-medium text-slate-900">{order.suggested_action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No risk orders found.</p>
        )}
      </div>
    </div>
  );
}
