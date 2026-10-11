"use client";

import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Compass, Home, Sparkles } from "lucide-react";

type Props = {
  locale: string;
};

export default function NotFoundContent({ locale }: Props) {
  const router = useRouter();
  const fa = locale === "fa";
  const Arrow = fa ? ArrowLeft : ArrowRight;

  const content = {
    badge: fa ? "مسیر پیدا نشد" : "PAGE NOT FOUND",
    title: fa ? "اوه! اینجا چیزی پیدا نشد." : "Oops! You're off the map.",
    description: fa
      ? "صفحه‌ای که دنبالش هستی وجود نداره یا آدرسش تغییر کرده. بیا به صفحه اصلی برگردیم و دوباره شروع کنیم."
      : "The page you're looking for doesn't exist or may have moved. Let's find our way back.",
    home: fa ? "بازگشت به خانه" : "Back to Home",
    back: fa ? "صفحه قبلی" : "Go Back",
  };

  return (
    <main
      dir={fa ? "rtl" : "ltr"}
      className="relative isolate flex min-h-[85svh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6"
    >
      {/* Background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -start-32 top-0 size-80 rounded-full bg-emerald-300/20 blur-[100px] dark:bg-emerald-500/10" />
        <div className="absolute -end-32 bottom-0 size-80 rounded-full bg-cyan-300/20 blur-[100px] dark:bg-cyan-500/10" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles size={14} />
          <span>{content.badge}</span>
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>404</span>
        </div>

        {/* Animated 404 */}
        <div className="relative mb-8">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-emerald-400/15 blur-[65px]"
          />

          <div className="relative motion-safe:animate-[bounce_5s_ease-in-out_infinite]">
            <h1 className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-[clamp(7rem,25vw,15rem)] font-black leading-none tracking-[-0.08em] text-transparent">
              404
            </h1>

            <span
              aria-hidden="true"
              className="absolute -end-2 top-2 flex size-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-white/80 text-emerald-600 shadow-xl backdrop-blur-xl dark:bg-slate-900/80 dark:text-emerald-400 sm:-end-8 sm:size-14"
            >
              <Compass size={26} />
            </span>
          </div>
        </div>

        {/* Text */}
        <h2 className="w-full text-balance text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {content.title}
        </h2>

        <p className="mt-5 w-full max-w-xl text-sm leading-8 text-slate-500 dark:text-slate-400 sm:text-base">
          {content.description}
        </p>

        {/* Buttons */}
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none sm:w-auto"
          >
            <Home size={18} />
            {content.home}
            <Arrow size={17} />
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-xl transition-colors hover:border-emerald-500/30 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 sm:w-auto"
          >
            {content.back}
          </button>
        </div>

        <p className="mt-12 text-xs tracking-widest text-slate-400 dark:text-slate-500">
          ERROR 404 — PAGE NOT FOUND
        </p>
      </div>
    </main>
  );
}
