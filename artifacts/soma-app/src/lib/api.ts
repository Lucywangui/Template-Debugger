import { SOMA_API_BASE_URL } from "@/lib/storage";

/* =========================================================
   FLASK BACKEND REQUESTS
   ========================================================= */

export class ApiError extends Error {
  constructor(
    message: string,
    /** Undefined when the server couldn't be reached. */
    public httpStatus?: number,
    public body: Record<string, unknown> = {}
  ) {
    super(message);
  }

  get isNetworkError() {
    return this.httpStatus === undefined;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${SOMA_API_BASE_URL}${path}`,
      {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
      }
    );
  } catch {
    throw new ApiError(
      "Can't reach SOMA HUB. Check your internet connection."
    );
  }

  const body = await response
    .json()
    .catch(() => ({}));

  if (!response.ok || body.success === false) {
    throw new ApiError(
      body.message || "Something went wrong. Please try again.",
      response.status,
      body
    );
  }

  return body as T;
}

export function postJson<T>(
  path: string,
  body: unknown
): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return (
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 12)
    );
  }
}
