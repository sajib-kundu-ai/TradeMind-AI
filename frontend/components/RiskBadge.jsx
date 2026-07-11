export default function RiskBadge({ level }) {
  const styles = {
    Low: "border-emerald-200 bg-emerald-500/10 text-emerald-200",
    Medium: "border-amber-300/20 bg-amber-500/10 text-amber-200",
    "Medium-High": "border-orange-300/20 bg-orange-500/10 text-orange-200",
    High: "border-rose-200 bg-rose-500/10 text-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
        styles[level] || "border-white/10 bg-white/[0.08] text-slate-300"
      }`}
    >
      {level}
    </span>
  );
}
