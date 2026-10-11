import AdminLogin from "@/components/admin/AdminLogin";
import { getAdminSession } from "@/lib/server/api";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  // مدیر واردشده نباید دوباره صفحه ورود را ببیند؛ بررسی سمت سرور انجام می‌شود.
  if (await getAdminSession()) redirect("/admin");
  return <AdminLogin />;
}
