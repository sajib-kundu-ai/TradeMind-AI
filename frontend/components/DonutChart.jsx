const DEFAULT_COLORS = ["#2563eb", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444"];

function compactValue(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toLocaleString();
}

function segmentColor(segment, index) {
  return segment.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export default function DonutChart({
  title,
  subtitle,
  segments = [],
  centerLabel = "Total",
  centerValue,
  legend = true,
  embedded = false,
}) {
  const safeSegments = segments
    .map((segment, index) => ({
      ...segment,
      value: Math.max(Number(segment.value || 0), 0),
      color: segmentColor(segment, index),
    }))
    .filter((segment) => segment.value > 0);
  const total = safeSegments.reduce((sum, segment) => sum + segment.value, 0);
  const hasData = total > 0;

  let cursor = 0;
  const gradientStops = safeSegments.map((segment) => {
    const start = cursor;
    const end = cursor + (segment.value / total) * 100;
    cursor = end;
    return `${segment.color} ${start}% ${end}%`;
  });
  const background = hasData
    ? `conic-gradient(${gradientStops.join(", ")})`
    : "conic-gradient(#e2e8f0 0% 100%)";

  return (
    <div className={embedded ? "" : "rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-sm"}>
      {(title || subtitle) && (
        <div>
          {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-6 md:flex-row">
        <div className="relative h-48 w-48 shrink-0 rounded-full p-4 shadow-inner" style={{ background }}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-900/70 text-center shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{centerLabel}</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {hasData ? centerValue || compactValue(total) : "No data"}
            </p>
          </div>
        </div>

        {legend && (
          <div className="w-full space-y-3">
            {hasData ? (
              safeSegments.map((segment) => {
                const percent = Math.round((segment.value / total) * 100);
                return (
                  <div key={segment.label} className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.06] p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`h-3 w-3 shrink-0 rounded-full ${segment.className || segment.colorClass || ""}`} style={{ backgroundColor: segment.color }} />
                      <span className="truncate text-sm font-semibold text-slate-300">{segment.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{segment.displayValue || compactValue(segment.value)}</p>
                      <p className="text-xs text-slate-400">{percent}%</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-white/[0.06] p-5 text-sm font-medium text-slate-400">
                No chart data available yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
