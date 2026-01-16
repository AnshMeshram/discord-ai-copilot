import { toast } from "sonner";

type ApiResult<T> = { data?: T; error?: string };

async function handleResponse<T>(res: Response): Promise<ApiResult<T>> {
  try {
    const json = await res.json();
    if (json?.success) return { data: json.data };
    return { error: json?.error || "Request failed. Please try again." };
  } catch (error) {
    return { error: "Invalid server response." };
  }
}

export async function apiGet<T>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { error: "Network error. Please try again." };
    return handleResponse<T>(res);
  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function apiPost<T>(
  url: string,
  body: unknown
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Network error. Please try again." };
    return handleResponse<T>(res);
  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function apiPut<T>(
  url: string,
  body: unknown
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: "Network error. Please try again." };
    return handleResponse<T>(res);
  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function apiDelete<T>(url: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) return { error: "Network error. Please try again." };
    return handleResponse<T>(res);
  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export const toastHelpers = {
  success: (
    message: string,
    opts?: { id?: string | number; duration?: number }
  ) => toast.success(message, opts),
  error: (message: string, opts?: { id?: string | number }) =>
    toast.error(message, opts),
  info: (message: string, opts?: { id?: string | number; duration?: number }) =>
    toast.info(message, opts),
  loading: (message: string) => toast.loading(message),
};
