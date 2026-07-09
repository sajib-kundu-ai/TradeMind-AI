const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function handleResponse(response) {
  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
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