"use client";

import { FormEvent, useState } from "react";
import type { ComponentType } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiOpenai,
  SiNodedotjs,
  SiClaude,
} from "react-icons/si";

import toast, { Toaster } from "react-hot-toast";
import { toApiRequestError } from "@/lib/api/axios";
import { loginAdmin } from "@/lib/api/requests/auth";

import { localizedError, messages } from "./adminShared";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type TechIcon = ComponentType<{
  className?: string;
  size?: number;
}>;

type Technology = {
  name: string;
  Icon: TechIcon;
  position: string;
  color: string;
  delay: string;
  duration: string;
};

const technologies: Technology[] = [
  {
    name: "JavaScript",
    Icon: SiJavascript,
    position: "left-[2%] top-[16%]",
    color: "text-yellow-400",
    delay: "0s",
    duration: "5s",
  },
  {
    name: "TypeScript",
    Icon: SiTypescript,
    position: "right-[3%] top-[12%]",
    color: "text-blue-400",
    delay: "-1.4s",
    duration: "5.8s",
  },
  {
    name: "React",
    Icon: SiReact,
    position: "left-[4%] top-[53%]",
    color: "text-cyan-400",
    delay: "-2.3s",
    duration: "6.2s",
  },
  {
    name: "Next.js",
    Icon: SiNextdotjs,
    position: "right-[3%] top-[55%]",
    color: "text-slate-100",
    delay: "-0.8s",
    duration: "5.4s",
  },
  {
    name: "ChatGPT",
    Icon: SiOpenai,
    position: "left-[26%] top-[3%]",
    color: "text-emerald-300",
    delay: "-2.7s",
    duration: "6.5s",
  },
  {
    name: "Node.js",
    Icon: SiNodedotjs,
    position: "left-[5%] bottom-[8%]",
    color: "text-green-400",
    delay: "-1.9s",
    duration: "5.6s",
  },
];

function FloatingTechnology({
  technology,
  compact = false,
}: {
  technology: Technology;
  compact?: boolean;
}) {
  const Icon = technology.Icon;

  return (
    <div className={`absolute z-20 ${technology.position}`}>
      <div
        className="
          tech-float
          flex items-center gap-2
          rounded-2xl
          border border-white/10
          bg-[#192b35]/95
          px-3 py-2.5
          shadow-[0_10px_30px_rgba(0,0,0,0.18)]
          backdrop-blur-xl
          sm:px-3.5
        "
        style={{
          animationDelay: technology.delay,
          animationDuration: technology.duration,
        }}
      >
        <Icon size={compact ? 17 : 20} className={technology.color} />

        <span
          className="
            text-[10px] font-semibold
            text-slate-100
            sm:text-xs
          "
        >
          {technology.name}
        </span>
      </div>
    </div>
  );
}

function ClaudeBadge() {
  return (
    <div className="absolute bottom-[6%] right-[19%] z-20">
      <div
        className="
          tech-float
          flex items-center gap-2
          rounded-2xl
          border border-white/10
          bg-[#192b35]/95
          px-3 py-2.5
          shadow-[0_10px_30px_rgba(0,0,0,0.18)]
          backdrop-blur-xl
        "
        style={{
          animationDelay: "-3.1s",
          animationDuration: "6.3s",
        }}
      >
        <SiClaude size={20} className="text-[#D97757]" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-slate-100 sm:text-xs">
          Claude
        </span>
      </div>
    </div>
  );
}

function LoginTechVisual({ fa }: { fa: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="
        relative mx-auto
        h-[280px] w-full max-w-[470px]
        overflow-hidden
        rounded-[26px]
        border border-white/10
        bg-[#0c1720]
        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
        sm:h-[350px]
        lg:h-[380px]
      "
    >
      {/* Background grid */}
      <div
        className="
          pointer-events-none absolute inset-0
          opacity-[0.12]
        "
        style={{
          backgroundImage: "radial-gradient(#94a3b8 0.7px, transparent 0.7px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          size-[250px]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          bg-emerald-400/15
          blur-[65px]
          sm:size-[300px]
        "
      />

      <div
        className="
          pointer-events-none absolute
          left-[18%] top-[16%]
          size-28 rounded-full
          bg-cyan-400/10 blur-3xl
        "
      />

      {/* Orbit circles */}
      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          size-[210px]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          border border-dashed
          border-emerald-400/20
          sm:size-[260px]
        "
      />

      <div
        className="
          pointer-events-none absolute
          left-1/2 top-1/2
          h-[145px] w-[270px]
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          border border-dashed
          border-cyan-400/15
          sm:h-[190px] sm:w-[350px]
        "
      />

      {/* Central glass card */}
      <div
        className="
          absolute left-1/2 top-1/2 z-10
          flex h-29 w-36
          -translate-x-1/2 -translate-y-1/2
          flex-col items-center justify-center
          gap-2 rounded-[22px]
          border border-emerald-400/30
          bg-[#13242c]/95
          shadow-[0_20px_60px_rgba(16,185,129,0.14)]
          backdrop-blur-xl
          sm:h-36 sm:w-44
        "
      >
        <div
          className="
            flex size-11 items-center justify-center
            rounded-2xl
            bg-emerald-400/10
            text-emerald-300
            sm:size-12
          "
        >
          <Code2 size={27} strokeWidth={1.7} />
        </div>

        <span
          className="
            text-xs font-bold text-white
            sm:text-sm
          "
        >
          AI × Development
        </span>

        <span
          className="
            flex items-center gap-1
            text-[9px]
            text-emerald-300/80
            sm:text-[10px]
          "
        >
          <Sparkles size={11} />
          {fa ? "خلق آینده" : "Building the future"}
        </span>
      </div>

      {/* Technology badges */}
      {technologies.map((technology) => (
        <FloatingTechnology key={technology.name} technology={technology} />
      ))}

      <ClaudeBadge />

      <style>{`
        @keyframes techFloating {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -9px, 0);
          }
        }

        .tech-float {
          animation-name: techFloating;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .tech-float {
            animation: none;
            will-change: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminLogin() {
  const locale = useLocale();
  const router = useRouter();

  const fa = locale === "fa";
  const lang = fa ? messages.fa : messages.en;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const Arrow = fa ? ArrowLeft : ArrowRight;

  // TODO(Codex):
  // Preserve this authentication flow exactly.
  // Do not change:
  // - POST /api/auth/login
  // - api() or localizedError()
  // - adminShared.ts
  // - JWT / HttpOnly cookie handling
  // - router.replace("/admin")
  //
  // Authorization must remain server-side.
  // This component is only the login interface.

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setError(lang.email);
      toast.error(lang.email);
      return;
    }

    if (!password) {
      setError(lang.required);
      toast.error(lang.required);
      return;
    }

    setBusy(true);

    try {
      await loginAdmin(normalizedEmail, password);

      router.replace("/admin");
    } catch (reason) {
      const normalized = toApiRequestError(reason);
      const status = normalized.status;

      const message =
        status === 401
          ? lang.invalidCredentials
          : status === 400
            ? lang.validation
            : localizedError({ ...normalized, code: status }, locale);

      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  const inputClass = `
    h-12 w-full
    rounded-2xl
    border border-slate-200/80
    bg-white/75
    px-4
    text-sm text-slate-900
    outline-none
    transition-[border-color,box-shadow,background-color]
    duration-200
    placeholder:text-slate-400
    hover:border-slate-300
    focus:border-emerald-500/60
    focus:ring-4 focus:ring-emerald-500/10
    dark:border-white/10
    dark:bg-white/[0.045]
    dark:text-slate-100
    dark:placeholder:text-slate-500
    dark:hover:border-white/20
    dark:focus:border-emerald-400/50
    dark:focus:ring-emerald-400/10
  `;

  return (
    <main
      dir={fa ? "rtl" : "ltr"}
      className="
        relative isolate
        flex min-h-[calc(100svh-80px)]
        items-center justify-center
        overflow-hidden
        bg-[#f8fafc]
        px-4 py-10
        text-slate-900
        transition-colors duration-300
        dark:bg-[#0c1118]
        dark:text-slate-100
        sm:px-6 sm:py-14
        lg:py-16
      "
    >
      <Toaster position={fa ? "bottom-left" : "bottom-right"} />

      {/* Background ambience */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute -top-48 -start-48
            size-[520px]
            rounded-full
            bg-emerald-300/25
            blur-[110px]
            dark:bg-emerald-500/[0.09]
          "
        />

        <div
          className="
            absolute -bottom-52 -end-40
            size-[500px]
            rounded-full
            bg-cyan-300/25
            blur-[110px]
            dark:bg-cyan-500/[0.08]
          "
        />
      </div>

      <div className="w-full max-w-6xl">
        {/* Brand */}
        <div
          className="
            mb-7 flex items-center justify-center gap-3
          "
        >
          <div
            className="
              flex size-11 items-center justify-center
              rounded-2xl
              border border-emerald-500/20
              bg-emerald-500/10
              text-emerald-700
              dark:text-emerald-300
            "
          >
            <ShieldCheck size={22} strokeWidth={1.7} aria-hidden="true" />
          </div>

          <div>
            <p
              className="
                text-base font-bold
                tracking-tight
                text-slate-900 dark:text-white
              "
            >
              Hamidreza Babazamani Studio
            </p>

            <p
              className="
                text-xs text-slate-500
                dark:text-slate-400
              "
            >
              {fa ? "فضای مدیریت پورتفولیو" : "Portfolio Management"}
            </p>
          </div>
        </div>

        {/* Login card */}
        <div
          className="
            grid overflow-hidden
            rounded-[30px]
            border border-emerald-900/[0.09]
            bg-white/75
            shadow-[0_24px_80px_rgba(15,23,42,0.08)]
            backdrop-blur-xl

            dark:border-white/[0.09]
            dark:bg-[#111922]/90
            dark:shadow-[0_24px_80px_rgba(0,0,0,0.2)]

            lg:grid-cols-[1.05fr_0.95fr]
          "
        >
          {/* Left visual section */}
          <aside
            className="
              relative flex min-w-0
              flex-col justify-center
              overflow-hidden
              border-b border-emerald-900/[0.06]
              bg-gradient-to-br
              from-[#e8faf1]
              via-[#e7f6f7]
              to-[#edf5ff]
              p-5

              dark:border-white/[0.06]
              dark:from-[#102b29]
              dark:via-[#11232b]
              dark:to-[#152337]

              sm:p-8
              lg:min-h-[650px]
              lg:border-b-0
              lg:border-e
              lg:p-10
              xl:p-12
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute -top-32 -end-32
                size-80 rounded-full
                bg-emerald-400/20 blur-3xl
                dark:bg-emerald-400/10
              "
            />

            <div className="relative">
              {/* Text hidden on smaller screens to save space */}
              <div className="mb-6 hidden lg:block">
                <span
                  className="
                    mb-5 inline-flex items-center gap-2
                    rounded-full
                    border border-emerald-500/15
                    bg-white/50
                    px-4 py-2
                    text-xs font-semibold
                    text-emerald-800
                    dark:border-emerald-400/15
                    dark:bg-white/[0.05]
                    dark:text-emerald-300
                  "
                >
                  <Sparkles size={14} aria-hidden="true" />
                  {fa
                    ? "توسعه نرم‌افزار و هوش مصنوعی"
                    : "Software & AI Development"}
                </span>

                <h1
                  className="
                    max-w-md
                    text-3xl font-bold
                    leading-[1.5]
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    xl:text-4xl
                  "
                >
                  {fa
                    ? "جایی که کدنویسی و هوش مصنوعی به هم می‌رسند"
                    : "Where code meets intelligence"}
                </h1>

                <p
                  className="
                    mt-4 max-w-md
                    text-sm leading-8
                    text-slate-600
                    dark:text-slate-300/80
                  "
                >
                  {fa
                    ? "توسعه وب مدرن با JavaScript، TypeScript، React، Next.js و ابزارهای هوش مصنوعی."
                    : "Modern web development powered by JavaScript, TypeScript, React, Next.js and AI tools."}
                </p>
              </div>

              <LoginTechVisual fa={fa} />

              <p
                className="
                  mt-4 hidden text-center
                  text-xs font-medium
                  tracking-wide
                  text-slate-500
                  dark:text-slate-400
                  lg:block
                "
              >
                JAVASCRIPT · TYPESCRIPT · REACT · NEXT.JS · AI
              </p>
            </div>
          </aside>

          {/* Form section */}
          <div
            className="
              flex min-w-0 flex-col
              justify-center
              px-6 py-9
              sm:px-10 sm:py-12
              xl:px-14 xl:py-16
            "
          >
            <div className="mb-8">
              <div
                className="
                  mb-5 flex size-12
                  items-center justify-center
                  rounded-2xl
                  border border-emerald-500/15
                  bg-emerald-500/[0.08]
                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                <LockKeyhole size={22} strokeWidth={1.7} aria-hidden="true" />
              </div>

              <span
                className="
                  mb-3 inline-block
                  text-xs font-semibold
                  tracking-wide
                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                {fa ? "ورود مدیر" : "ADMIN ACCESS"}
              </span>

              <h2
                className="
                  text-2xl font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                  sm:text-3xl
                "
              >
                {fa ? "خوش برگشتی!" : "Welcome back"}
              </h2>

              <p
                className="
                  mt-3 text-sm leading-7
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {fa
                  ? "برای دسترسی به داشبورد، اطلاعات حساب مدیر را وارد کن."
                  : "Enter your admin credentials to access the dashboard."}
              </p>
            </div>

            <form
              onSubmit={submit}
              noValidate
              aria-busy={busy}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="
                    block text-sm font-semibold
                    text-slate-700
                    dark:text-slate-200
                  "
                >
                  {fa ? "آدرس ایمیل" : "Email address"}
                </label>

                <input
                  id="admin-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  dir="ltr"
                  required
                  disabled={busy}
                  placeholder="admin@example.com"
                  aria-invalid={!!error}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="
                    block text-sm font-semibold
                    text-slate-700
                    dark:text-slate-200
                  "
                >
                  {fa ? "رمز عبور" : "Password"}
                </label>

                <div className="relative">
                  <input
                    id="admin-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    dir="ltr"
                    required
                    disabled={busy}
                    placeholder="••••••••••"
                    aria-invalid={!!error}
                    className={`${inputClass} pe-13`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={busy}
                    aria-label={
                      showPassword
                        ? fa
                          ? "مخفی کردن رمز عبور"
                          : "Hide password"
                        : fa
                          ? "نمایش رمز عبور"
                          : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="
                      absolute inset-y-0 end-2
                      flex w-10 items-center justify-center
                      rounded-xl
                      text-slate-400
                      transition-colors
                      hover:text-emerald-700
                      focus-visible:outline-2
                      focus-visible:outline-emerald-500
                      dark:hover:text-emerald-300
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="
                    rounded-2xl
                    border border-rose-500/20
                    bg-rose-500/[0.07]
                    px-4 py-3.5
                    text-sm leading-6
                    text-rose-700
                    dark:text-rose-300
                  "
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="
                  mt-3 flex h-12 w-full
                  items-center justify-center gap-2.5
                  rounded-2xl
                  bg-gradient-to-r
                  from-emerald-600 to-teal-600
                  px-5
                  text-sm font-bold text-white
                  shadow-[0_10px_25px_rgba(16,185,129,0.2)]
                  transition-[box-shadow,transform,opacity]
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_30px_rgba(16,185,129,0.3)]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-emerald-500
                  disabled:cursor-wait
                  disabled:opacity-60
                  motion-reduce:transform-none
                "
              >
                {busy ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span>{fa ? "در حال ورود..." : "Signing in..."}</span>
                  </>
                ) : (
                  <>
                    <span>{fa ? "ورود به داشبورد" : "Enter dashboard"}</span>

                    <Arrow size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div
              className="
                mt-8 flex items-center justify-center gap-2
                border-t border-slate-200/70
                pt-6
                dark:border-white/10
              "
            >
              <KeyRound
                size={15}
                className="text-slate-400"
                aria-hidden="true"
              />

              <p
                className="
                  text-center text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {fa
                  ? "دسترسی محدود به حساب‌های مجاز"
                  : "Authorized accounts only"}
              </p>
            </div>
          </div>
        </div>

        <p
          className="
            mt-6 text-center
            text-xs text-slate-400
            dark:text-slate-500
          "
        >
          © {new Date().getFullYear()} Hamidreza Babazamani Studio
        </p>
      </div>
    </main>
  );
}
