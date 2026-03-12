const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type QueryValue = string | number | undefined;

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
    throw new Error(`GET ${path} failed: ${response.status}`);
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
    throw new Error(`POST ${path} failed: ${response.status}`);
  }

  return response.json() as Promise<TResp>;
}
