export default function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-white/10 tm-glass p-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
