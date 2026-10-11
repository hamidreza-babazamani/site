import { apiClient } from "@/lib/api/axios";
import type { AdminUser, ApiEnvelope } from "@/lib/api/types";

/**
 * ورود مدیر را انجام می‌دهد.
 * متد POST است و ایمیل/رمز عبور را در بدنه JSON می‌فرستد؛ پاسخ، کوکی HttpOnly
 * را روی همان origin تنظیم می‌کند و توکن هرگز در جاوااسکریپت مرورگر خوانده نمی‌شود.
 */
export async function loginAdmin(email: string, password: string) {
  const response = await apiClient.post<ApiEnvelope<never> & { admin: AdminUser }>(
    "/api/auth/login",
    { email, password },
  );
  return response.data;
}

/** پایان نشست مدیر؛ کوکی احراز هویت در سمت سرور منقضی می‌شود. */
export async function logoutAdmin() {
  const response = await apiClient.post<ApiEnvelope<never>>("/api/auth/logout");
  return response.data;
}

/**
 * نشست جاری را بررسی می‌کند. کوکی به‌صورت خودکار همراه درخواست same-origin
 * ارسال می‌شود و در صورت 401، خطای استاندارد Axios قابل مدیریت است.
 */
export async function getAdminSession() {
  const response = await apiClient.get<ApiEnvelope<never> & { admin: AdminUser }>(
    "/api/auth/me",
  );
  return response.data;
}
