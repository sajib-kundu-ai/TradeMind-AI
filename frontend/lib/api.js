const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.error || `API request failed (${response.status})`);
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

  const response = await fetch(
    `${API_BASE_URL}/api/upload-analysis?limit=${limit}`,
    {
      method: "POST",
      body: formData,
    }
  );

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
