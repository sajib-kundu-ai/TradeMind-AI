export default function StatCard({ title, value, subtitle, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500 to-cyan-400 shadow-blue-500/20",
    red: "from-rose-500 to-orange-400 shadow-rose-500/20",
    green: "from-emerald-500 to-teal-400 shadow-emerald-500/20",
    purple: "from-violet-500 to-fuchsia-400 shadow-violet-500/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(59,130,246,0.12)]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone]}`} />
      <div className={`mb-5 h-10 w-10 rounded-2xl bg-gradient-to-br opacity-90 shadow-lg ${tones[tone]}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
