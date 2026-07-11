"use client";

import { Download } from "lucide-react";

export default function ReportButton({ title, description, filename, content }) {
  function downloadReport() {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-white/10 tm-glass p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 shadow-lg shadow-cyan-500/10">
          <Download size={22} />
        </div>
      </div>

      <button
        type="button"
        onClick={downloadReport}
        disabled={!content}
        className="mt-6 w-full rounded-2xl tm-button-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-white/15 disabled:bg-none disabled:text-slate-400"
      >
        Download
      </button>
    </div>
  );
}
