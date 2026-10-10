import AdminLogin from "@/components/admin/AdminLogin";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <AdminLogin />;
}
