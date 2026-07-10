import { getLatestAnalysis } from "@/lib/api";

export function isDemoAnalysis(data) {
  if (!data) return false;
  const sourceText = `${data.source || ""} ${data.data_source || ""} ${data.source_label || ""}`.toLowerCase();
  if (sourceText.includes("demo")) return true;
  return Number(data.risk_summary?.total_orders || 0) >= 20000;
}

export function hasAnalysisData(data) {
  return Boolean(
    data?.risk_summary ||
      data?.profit_summary ||
      data?.stock_summary ||
      data?.risk_orders?.length ||
      data?.profit_products?.length ||
      data?.stock_items?.length
  );
}

export function getAnalysisStorageKey() {
  try {
    const email = (window.localStorage.getItem("trademind_user_email") || "").trim().toLowerCase();
    return email ? `trademind_latest_analysis_${email}` : "";
  } catch {
    return "";
  }
}

export function readStoredAnalysis() {
  try {
    const storageKey = getAnalysisStorageKey();
    if (!storageKey) return null;
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : null;
    return isDemoAnalysis(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export function saveStoredAnalysis(analysis) {
  try {
    const storageKey = getAnalysisStorageKey();
    if (!storageKey || !analysis || isDemoAnalysis(analysis)) return;
    window.localStorage.setItem(storageKey, JSON.stringify(analysis));
    window.localStorage.removeItem("trademind_latest_analysis");
  } catch {
    // Local cache is optional.
  }
}

export function readAuthToken() {
  try {
    return window.localStorage.getItem("trademind_token");
  } catch {
    return null;
  }
}

export async function loadPreferredAnalysis() {
  const token = readAuthToken();

  if (token) {
    try {
      const latest = await getLatestAnalysis(token);
      saveStoredAnalysis(latest);
      return { data: latest, source: "Latest saved analysis" };
    } catch {
      // Continue to local fallback.
    }
  }

  const stored = readStoredAnalysis();
  if (stored) {
    return { data: stored, source: "Uploaded analysis" };
  }

  return { data: null, source: "No analysis yet" };
}
