const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type QueryValue = string | number | undefined;

async function buildApiError(response: Response, method: string, path: string) {
  let detail = "";
  try {
    const json = (await response.json()) as { message?: string };
    detail = json?.message ?? "";
  } catch {
    detail = "";
  }

  return new Error(`${method} ${path} failed: ${response.status}${detail ? ` - ${detail}` : ""}`);
}

export async function apiGet<T>(path: string, params?: object): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params as Record<string, QueryValue>).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw await buildApiError(response, "GET", path);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<TBody, TResp>(path: string, body: TBody): Promise<TResp> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    keepalive: true,
  });

  if (!response.ok) {
    throw await buildApiError(response, "POST", path);
  }

  return response.json() as Promise<TResp>;
}

export async function apiPatch<TBody, TResp>(path: string, body: TBody): Promise<TResp> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await buildApiError(response, "PATCH", path);
  }

  return response.json() as Promise<TResp>;
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await buildApiError(response, "DELETE", path);
  }
}
