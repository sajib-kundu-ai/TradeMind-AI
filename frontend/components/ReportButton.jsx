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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Download size={22} />
        </div>
      </div>

      <button
        type="button"
        onClick={downloadReport}
        disabled={!content}
        className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Download
      </button>
    </div>
  );
}
