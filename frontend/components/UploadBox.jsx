"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";

export default function UploadBox() {
  const [fileName, setFileName] = useState("");

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Upload Order Data</h2>
          <p className="mt-2 text-sm text-slate-500">
            Upload CSV/Excel order data to analyze risk, profit, and stock insights.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <UploadCloud size={24} />
        </div>
      </div>

      <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50">
        <UploadCloud className="text-slate-400" size={42} />
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Click to upload CSV or Excel file
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Required: order_id, product, payment_type, amount, phone_verified
        </p>

        <input
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {fileName && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-800">{fileName}</span>
          </div>
          <CheckCircle2 className="text-green-600" size={20} />
        </div>
      )}

      <button className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
        Analyze Orders
      </button>
    </div>
  );
}