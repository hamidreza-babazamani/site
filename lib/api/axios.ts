import axios from "axios";

const requestBaseURL =
  typeof window !== "undefined"
    ? ""
    : (() => {
        const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
        if (configured) {
          const url = new URL(configured);
          if (url.protocol !== "http:" && url.protocol !== "https:")
            throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL");
          return url.origin;
        }
        if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
        if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:3000";
        throw new Error("NEXT_PUBLIC_SITE_URL is required for server HTTP requests");
      })();

/**
 * Central Axios boundary for browser/API calls. The public Hero read currently
 * runs on the server, but keeping one configured client prevents divergent
 * timeout and response handling when a client-side Hero mutation is needed.
 */
export const apiClient = axios.create({
  // در مرورگر relative path باعث same-origin بودن درخواست و عدم نشت cookie می‌شود.
  // در سرور فقط یک origin معتبر استفاده می‌کنیم؛ localhost هرگز fallback تولید نیست.
  baseURL: requestBaseURL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

// درخواست‌های عمومی نباید cookie احراز هویت پنل مدیریت را همراه خود بفرستند.
export const publicApiClient = axios.create({
  baseURL: requestBaseURL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
  withCredentials: false,
});

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly kind: "network" | "timeout" | "http" | "response",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export const toApiRequestError = (error: unknown): ApiRequestError => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
      return new ApiRequestError("Request timed out", "timeout", error.response?.status);
    if (!error.response)
      return new ApiRequestError("Network request failed", "network");
    if (error.response.status >= 400)
      return new ApiRequestError("API request failed", "http", error.response.status);
    return new ApiRequestError("Unexpected API response", "response", error.response.status);
  }
  return new ApiRequestError("Unexpected API error", "response");
};
