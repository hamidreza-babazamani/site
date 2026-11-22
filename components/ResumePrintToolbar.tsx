"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, Languages } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function ResumePrintToolbar({
  locale,
  source,
  autoPrint = false,
}: {
  locale: "fa" | "en";
  source: "draft" | "published";
  autoPrint?: boolean;
}) {
  const router = useRouter();
  const isFa = locale === "fa";
  const otherLocale = isFa ? "en" : "fa";
  const query = source === "draft" ? "?source=draft" : "";

  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => {
      window.print();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <div
      dir={isFa ? "rtl" : "ltr"}
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur print:hidden"
    >
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {isFa ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
            <span>{isFa ? "بازگشت" : "Back"}</span>
          </button>

          <Link
            href="/resume"
            className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            {isFa ? "صفحه رزومه" : "Resume Page"}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/${otherLocale}/resume/print${query}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-500/40 hover:bg-emerald-50"
          >
            <Languages size={15} />
            <span>{isFa ? "English Version" : "نسخه فارسی"}</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
          >
            <Download size={15} />
            <span>
              {isFa
                ? "دانلود / ذخیره PDF"
                : "Download / Save as PDF"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
