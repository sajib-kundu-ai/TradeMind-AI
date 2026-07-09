import RiskBadge from "./RiskBadge";

const orders = [
  {
    id: "ORD-1024",
    product: "Headphone",
    amount: "৳7,500",
    risk: "High",
    score: 87,
    reasons: ["COD", "Phone not verified", "Long distance"],
    action: "Call before shipping",
  },
  {
    id: "ORD-1031",
    product: "Cosmetics",
    amount: "৳2,200",
    risk: "Medium",
    score: 58,
    reasons: ["New customer", "Incomplete address"],
    action: "Send confirmation",
  },
  {
    id: "ORD-1042",
    product: "T-Shirt",
    amount: "৳1,200",
    risk: "Low",
    score: 22,
    reasons: ["Verified phone", "Complete address"],
    action: "Ship normally",
  },
];

export default function RiskTable() {
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
              <tr key={order.id}>
                <td className="py-4 font-semibold text-slate-900">
                  {order.id}
                </td>
                <td>{order.product}</td>
                <td>{order.amount}</td>
                <td>
                  <RiskBadge level={order.risk} />
                </td>
                <td className="font-semibold">{order.score}/100</td>
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
                <td className="font-medium text-slate-900">{order.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}