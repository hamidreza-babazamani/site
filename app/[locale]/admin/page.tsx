import AdminApp from "@/components/admin/AdminApp";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminApp />;
}
