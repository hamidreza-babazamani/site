import AdminApp from "@/components/admin/AdminApp";
import { getAdminSession } from "@/lib/server/api";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  // احراز هویت قبل از رندر انجام می‌شود تا محتوای محافظت‌شده چشمک نزند.
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return <AdminApp initialAdmin={admin} />;
}
