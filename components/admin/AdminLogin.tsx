"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LockKeyhole, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const locale = useLocale();
  const router = useRouter();
  const fa = locale === "fa";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const Arrow = fa ? ArrowLeft : ArrowRight;

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        const message = fa ? "لطفاً ایمیل معتبر وارد کنید." : "Please enter a valid email address.";
        setError(message); toast.error(message); return;
      }
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), credentials: "include" });
      await response.json().catch(() => null);
      if (!response.ok) throw new Error(response.status === 401 ? (fa ? "ایمیل یا رمز عبور نادرست است." : "Invalid email or password.") : (fa ? "ورود ناموفق بود." : "Unable to sign in."));
      router.replace(`/admin`);
    } catch (reason) { const message = reason instanceof Error ? reason.message : (fa ? "خطایی رخ داد." : "Something went wrong."); setError(message); toast.error(message); }
    finally { setBusy(false); }
  }

  return <main className="min-h-[78vh] bg-[#0b1118] px-5 py-16 text-white sm:px-8"><Toaster position={fa ? "bottom-left" : "bottom-right"} />
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-12 lg:block">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between"><div><div className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20"><ShieldCheck /></div><p className="mb-4 text-sm font-semibold uppercase tracking-[.25em] text-white/80">Kamyar Studio</p><h1 className="max-w-sm text-4xl font-black leading-tight">{fa ? "مرکز مدیریت محتوای شما" : "Your content command center"}</h1></div><p className="max-w-sm text-sm leading-7 text-white/80">{fa ? "پروژه‌ها، مهارت‌ها و پیام‌های دریافتی را در یک فضای امن مدیریت کنید." : "Manage your portfolio, content and incoming messages from one secure workspace."}</p></div>
      </div>
      <form onSubmit={submit} className="p-7 sm:p-12"><div className="mb-10"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 lg:hidden"><LockKeyhole /></div><p className="mb-2 text-sm font-medium text-emerald-300">{fa ? "ورود مدیر" : "Admin access"}</p><h2 className="text-3xl font-bold">{fa ? "خوش آمدید" : "Welcome back"}</h2><p className="mt-3 text-sm text-slate-400">{fa ? "برای ورود اطلاعات حساب خود را وارد کنید." : "Sign in to continue to your dashboard."}</p></div>
        <label className="mb-5 block"><span className="mb-2 block text-sm text-slate-300">{fa ? "ایمیل" : "Email"}</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 outline-none transition focus:border-emerald-400" /></label>
        <label className="mb-5 block"><span className="mb-2 block text-sm text-slate-300">{fa ? "رمز عبور" : "Password"}</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 outline-none transition focus:border-emerald-400" /></label>
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60">{busy ? (fa ? "در حال ورود..." : "Signing in...") : (fa ? "ورود به داشبورد" : "Enter dashboard")}<Arrow size={18} /></button>
      </form>
    </div>
  </main>;
}
