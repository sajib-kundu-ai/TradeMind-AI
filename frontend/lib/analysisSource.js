import { getDemoAnalysis, getLatestAnalysis } from "@/lib/api";

export function readStoredAnalysis() {
  try {
    const stored = window.localStorage.getItem("trademind_latest_analysis");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function readAuthToken() {
  try {
    return window.localStorage.getItem("trademind_token");
  } catch {
    return null;
  }
}

export async function loadPreferredAnalysis(limit = 100) {
  const token = readAuthToken();

  if (token) {
    try {
      const latest = await getLatestAnalysis(token);
      window.localStorage.setItem("trademind_latest_analysis", JSON.stringify(latest));
      return { data: latest, source: "Latest saved analysis" };
    } catch {
      // Continue to local/demo fallback.
    }
  }

  const stored = readStoredAnalysis();
  if (stored) {
    return { data: stored, source: "Uploaded analysis" };
  }

  const demo = await getDemoAnalysis(limit);
  return { data: demo, source: "Demo dataset" };
}
