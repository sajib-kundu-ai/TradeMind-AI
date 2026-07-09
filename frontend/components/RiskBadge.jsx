export default function RiskBadge({ level }) {
  const styles = {
    Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    "Medium-High": "border-orange-200 bg-orange-50 text-orange-700",
    High: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
        styles[level] || "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {level}
    </span>
  );
}
