export default function StatCard({ title, value, subtitle, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500 to-cyan-400 shadow-blue-500/20",
    red: "from-rose-500 to-orange-400 shadow-rose-500/20",
    green: "from-emerald-500 to-teal-400 shadow-emerald-500/20",
    purple: "from-violet-500 to-fuchsia-400 shadow-violet-500/20",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 tm-glass p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_18px_46px_rgba(14,165,233,0.12)]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone]}`} />
      <div className={`mb-5 h-9 w-9 rounded-xl bg-gradient-to-br opacity-90 shadow-lg ${tones[tone]}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <h2 className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-white">{value}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
