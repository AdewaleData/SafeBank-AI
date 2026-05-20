const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function parseApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "Something went wrong. Please try again.";
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item !== "object" || !item || !("msg" in item)) return "";
        const msg = String((item as { msg: string }).msg);
        const loc = "loc" in item && Array.isArray((item as { loc: unknown[] }).loc)
          ? (item as { loc: unknown[] }).loc.filter((p) => p !== "body").join(" ")
          : "";
        return loc ? `${loc}: ${msg}` : msg;
      })
      .filter(Boolean);
    if (messages.length) return messages.join(". ");
  }
  return "Something went wrong. Please try again.";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("safebank_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[SafeBank API] ${options.method || "GET"} ${path}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = parseApiError(data);
    console.error(`[SafeBank API] Error ${res.status}:`, data);
    throw new ApiError(message, res.status);
  }

  return data as T;
}
