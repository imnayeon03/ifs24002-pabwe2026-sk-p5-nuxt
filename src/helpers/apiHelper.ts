const ACCESS_TOKEN_KEY = "access_token";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  status?: string;
  message: string;
  data?: T;
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: QueryParams;
  body?: unknown;
  auth?: boolean;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const isEmpty = (value: QueryValue): boolean =>
  value === undefined || value === null || value === "";

/** { type: "inflow", label: "" } => "?type=inflow" (nilai kosong diabaikan) */
export function buildQueryString(params: QueryParams = {}): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!isEmpty(value)) {
      query.append(key, String(value));
    }
  });

  const result = query.toString();
  return result ? `?${result}` : "";
}

/** API Delcom memakai `status: "success"`; fallback jaringan memakai `success`. */
export function isApiSuccess(res: ApiResponse | undefined | null): boolean {
  return res?.success === true || res?.status === "success";
}

/** Wrapper fetch ke REST API Delcom. Tidak pernah melempar error. */
export async function fetchApi<T = unknown>(
  path: string,
  { method = "GET", params, body, auth = true }: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${DELCOM_BASEURL}${path}${buildQueryString(params)}`;
  const headers: Record<string, string> = {};
  const token = getAccessToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
