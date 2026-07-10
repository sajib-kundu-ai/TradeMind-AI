const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.detail || data.error || `API request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getDemoAnalysis(limit = 20) {
  const response = await fetch(`${API_BASE_URL}/api/demo-analysis?limit=${limit}`, {
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function uploadAnalysis(file, limit = 20) {
  const formData = new FormData();
  formData.append("file", file);

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("trademind_token")
      : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const response = await fetch(
    `${API_BASE_URL}/api/upload-analysis?limit=${limit}`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  return handleResponse(response);
}

export async function uploadStockAnalysis(file, token, options = {}) {
  const formData = new FormData();
  formData.append("file", file);

  const merge = options.merge ?? true;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 60000);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/stock/upload-analysis?merge=${merge}`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Stock upload timed out. Try a smaller CSV/XLSX file.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  return handleResponse(response);
}

export async function requestOtp(email) {
  const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
}

export async function verifyOtp(email, otp) {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return handleResponse(response);
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function getHistory(token) {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function getLatestStockAnalysis(token) {
  const response = await fetch(`${API_BASE_URL}/api/stock/latest`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function getStockHistory(token) {
  const response = await fetch(`${API_BASE_URL}/api/stock/history`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function getStockHistoryItem(id, token) {
  const response = await fetch(`${API_BASE_URL}/api/stock/history/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function deleteStockHistoryItem(id, token) {
  const response = await fetch(`${API_BASE_URL}/api/stock/history/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export const deleteStockHistory = deleteStockHistoryItem;

export async function getHistoryItem(token, id) {
  const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function deleteHistoryItem(token, id) {
  const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function reanalyzeHistoryItem(id, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/api/history/${id}/reanalyze`, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function getLatestAnalysis(token) {
  const response = await fetch(`${API_BASE_URL}/api/latest-analysis`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function reanalyzeLatestAnalysis(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/api/latest-analysis/reanalyze`, {
    method: "POST",
    headers,
    cache: "no-store",
  });

  return handleResponse(response);
}

export async function predictOrder(order) {
  const response = await fetch(`${API_BASE_URL}/api/predict-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  return handleResponse(response);
}

export async function predictOrderText(message) {
  const response = await fetch(`${API_BASE_URL}/api/predict-order-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  return handleResponse(response);
}

export async function getModelMetrics() {
  const response = await fetch(`${API_BASE_URL}/api/model-metrics`, {
    cache: "no-store",
  });

  return handleResponse(response);
}
