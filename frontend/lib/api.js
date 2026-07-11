const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const REQUEST_TIMEOUT_MS = 60000;

function readToken(explicitToken) {
  if (explicitToken) return explicitToken;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("trademind_token");
  } catch {
    return null;
  }
}

function buildUrl(path, query) {
  const url = new URL(path, API_BASE_URL);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function extractErrorMessage(data, status) {
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join("; ");
  }
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;
  return `API request failed (${status})`;
}

async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    query,
    token,
    timeoutMs = REQUEST_TIMEOUT_MS,
    cache = "no-store",
  } = options;
  const headers = {};
  const authToken = readToken(token);

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let requestBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: requestBody,
      cache,
      signal: controller.signal,
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      const error = new Error(extractErrorMessage(data, response.status));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out after 60 seconds. Try a smaller file or restart the backend.");
    }
    if (
      error instanceof TypeError ||
      error.message === "Failed to fetch" ||
      error.message === "NetworkError when attempting to fetch resource."
    ) {
      throw new Error("Backend server is not running. Start FastAPI on port 8000.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getDemoAnalysis(limit = 20) {
  return apiRequest("/api/demo-analysis", { query: { limit } });
}

export async function uploadAnalysis(file, limit = null) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/api/upload-analysis", {
    method: "POST",
    body: formData,
    query: { limit },
  });
}

export async function uploadStockAnalysis(file, token, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/api/stock/upload-analysis", {
    method: "POST",
    body: formData,
    query: { merge: options.merge ?? true },
    token,
  });
}

export async function requestOtp(email) {
  return apiRequest("/api/auth/request-otp", {
    method: "POST",
    body: { email },
    cache: undefined,
  });
}

export async function verifyOtp(email, otp) {
  return apiRequest("/api/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
    cache: undefined,
  });
}

export async function getCurrentUser(token) {
  return apiRequest("/api/auth/me", { token });
}

export async function getHistory(token) {
  return apiRequest("/api/history", { token });
}

export async function getHistoryItem(token, id) {
  return apiRequest(`/api/history/${id}`, { token });
}

export const getHistoryDetail = getHistoryItem;

export async function deleteHistoryItem(token, id) {
  return apiRequest(`/api/history/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function reanalyzeHistoryItem(id, token) {
  return apiRequest(`/api/history/${id}/reanalyze`, {
    method: "POST",
    token,
  });
}

export const reanalyzeHistory = reanalyzeHistoryItem;

export async function getLatestAnalysis(token) {
  return apiRequest("/api/latest-analysis", { token });
}

export async function reanalyzeLatestAnalysis(token) {
  return apiRequest("/api/latest-analysis/reanalyze", {
    method: "POST",
    token,
  });
}

export const reanalyzeLatest = reanalyzeLatestAnalysis;

export async function predictOrder(order) {
  return apiRequest("/api/predict-order", {
    method: "POST",
    body: order,
  });
}

export async function predictOrderText(message) {
  return apiRequest("/api/predict-order-text", {
    method: "POST",
    body: { message },
  });
}

export async function getModelMetrics() {
  return apiRequest("/api/model-metrics");
}

export async function getLatestStockAnalysis(token) {
  return apiRequest("/api/stock/latest", { token });
}

export const getStockLatest = getLatestStockAnalysis;

export async function getStockHistory(token) {
  return apiRequest("/api/stock/history", { token });
}

export async function getStockHistoryItem(id, token) {
  return apiRequest(`/api/stock/history/${id}`, { token });
}

export async function deleteStockHistoryItem(id, token) {
  return apiRequest(`/api/stock/history/${id}`, {
    method: "DELETE",
    token,
  });
}

export const deleteStockHistory = deleteStockHistoryItem;
