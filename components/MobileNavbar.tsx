
"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileUser,
  UserRound,
  House,
  Mail,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    path: "/" as const,
    key: "home" as const,
    icon: House,
  },
  {
    path: "/services" as const,
    key: "services" as const,
    icon: Sparkles,
  },
  {
    path: "/resume" as const,
    key: "resume" as const,
    icon: FileUser,
  },
  {
    path: "/profile" as const,
    key: "profile" as const,
    icon: UserRound,
  },
  {
    path: "/work" as const,
    key: "work" as const,
    icon: BriefcaseBusiness,
  },
  {
    path: "/contact" as const,
    key: "contact" as const,
    icon: Mail,
  },
];

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const locale = useLocale();
  const t = useTranslations("HomePage");
  const pathname = usePathname();

  const isPersian = locale === "fa";

  // بستن منو هنگام تغییر مسیر
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={
            isPersian ? "باز کردن منو" : "Open navigation menu"
          }
          className="
            inline-flex size-11
            shrink-0 items-center justify-center
            rounded-xl
            border border-emerald-900/10
            bg-white/70
            text-slate-700
            shadow-[0_4px_16px_rgba(15,118,110,0.04)]
            backdrop-blur-md
            transition-[background-color,border-color,color]
            duration-300
            hover:border-emerald-500/30
            hover:bg-emerald-50/80
            hover:text-emerald-700
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-emerald-500
            dark:border-white/10
            dark:bg-white/[0.05]
            dark:text-slate-200
            dark:hover:border-emerald-400/30
            dark:hover:bg-emerald-400/[0.08]
            dark:hover:text-emerald-300
          "
        >
          <Menu
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>
      </SheetTrigger>

      <SheetContent
        side={isPersian ? "right" : "left"}
        dir={isPersian ? "rtl" : "ltr"}
        className="
          flex w-[min(88vw,360px)]
          flex-col
          overflow-y-auto
          border-emerald-900/10
          bg-[#f8fafc]/95
          p-0
          text-slate-800
          shadow-2xl
          backdrop-blur-2xl
          dark:border-white/10
          dark:bg-[#0c1118]/95
          dark:text-slate-100
          [&>button]:hidden
        "
      >
        {/* Accessible title */}
        <SheetTitle className="sr-only">
          {isPersian ? "منوی اصلی" : "Main navigation"}
        </SheetTitle>

        <SheetDescription className="sr-only">
          {isPersian
            ? "انتخاب صفحه مورد نظر"
            : "Choose a page to navigate to"}
        </SheetDescription>

        {/* Header */}
        <div
          className="
            relative
            flex items-center justify-between
            border-b border-emerald-900/10
            px-5 py-6
            dark:border-white/10
          "
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="
              inline-flex items-center
              gap-3
              rounded-lg
              focus-visible:outline-2
              focus-visible:outline-emerald-500
            "
          >
            <div
              className="
                flex size-11 items-center justify-center
                rounded-2xl
                border border-emerald-500/20
                bg-gradient-to-br
                from-emerald-500/15
                to-cyan-500/10
              "
            >
              <span
                className="
                  text-lg font-black
                  text-emerald-700
                  dark:text-emerald-300
                "
              >
                K.
              </span>
            </div>

            <div className="flex flex-col">
              <span
                className="
                  text-base font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Kamyar.Dev
              </span>

              <span
                className="
                  text-[11px]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Portfolio
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label={
              isPersian ? "بستن منو" : "Close navigation menu"
            }
            className="
              flex size-9 items-center justify-center
              rounded-xl
              border border-slate-200/80
              bg-white/70
              text-slate-500
              transition-colors
              hover:bg-emerald-500/10
              hover:text-emerald-700
              dark:border-white/10
              dark:bg-white/[0.05]
              dark:text-slate-400
              dark:hover:text-emerald-300
            "
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label={
            isPersian ? "ناوبری اصلی" : "Main navigation"
          }
          className="flex-1 px-4 py-7"
        >
          <div
            className="
              mb-5 px-3
              text-[11px] font-semibold
              uppercase tracking-[0.16em]
              text-emerald-700
              dark:text-emerald-400
            "
          >
            {isPersian ? "صفحات سایت" : "Explore"}
          </div>

          <ul className="space-y-2">
            {navItems.map((item) => {
              const active =
                item.path === "/"
                  ? pathname === "/"
                  : pathname === item.path ||
                    pathname.startsWith(`${item.path}/`);

              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={closeMenu}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={`
                      group relative flex
                      min-h-14 items-center
                      gap-3.5
                      rounded-2xl
                      border px-4 py-3
                      text-sm font-medium
                      transition-[background-color,color,border-color,box-shadow]
                      duration-300
                      focus-visible:outline-2
                      focus-visible:outline-emerald-500
                      ${
                        active
                          ? `
                            border-emerald-500/20
                            bg-emerald-500/10
                            text-emerald-800
                            shadow-[0_4px_18px_rgba(16,185,129,0.06)]
                            dark:border-emerald-400/20
                            dark:bg-emerald-400/10
                            dark:text-emerald-300
                          `
                          : `
                            border-transparent
                            text-slate-600
                            hover:border-emerald-500/10
                            hover:bg-emerald-500/[0.06]
                            hover:text-emerald-800
                            dark:text-slate-300
                            dark:hover:border-white/10
                            dark:hover:bg-white/[0.05]
                            dark:hover:text-emerald-300
                          `
                      }
                    `}
                  >
                    <span
                      className={`
                        flex size-9 shrink-0
                        items-center justify-center
                        rounded-xl
                        transition-colors duration-300
                        ${
                          active
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-900/[0.04] text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-700 dark:bg-white/[0.05] dark:text-slate-400 dark:group-hover:text-emerald-300"
                        }
                      `}
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </span>

                    <span className="flex-1">
                      {t(`links.${item.key}`)}
                    </span>

                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className={`
                        shrink-0
                        transition-colors duration-300
                        ${
                          active
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-300 group-hover:text-emerald-500 dark:text-slate-600"
                        }
                      `}
                    />

                    {active && (
                      <span
                        aria-hidden="true"
                        className="
                          absolute inset-y-3
                          start-0 w-[3px]
                          rounded-full
                          bg-gradient-to-b
                          from-emerald-500
                          to-cyan-500
                        "
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div
          className="
            relative overflow-hidden
            border-t border-emerald-900/10
            px-5 py-6
            dark:border-white/10
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute -bottom-20 -end-16
              size-48 rounded-full
              bg-emerald-400/10
              blur-3xl
              dark:bg-emerald-400/[0.06]
            "
          />

          <div
            className="
              relative flex items-center
              gap-2 text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            <span
              aria-hidden="true"
              className="
                size-2 rounded-full
                bg-emerald-500
                shadow-[0_0_10px_rgba(16,185,129,0.45)]
              "
            />

            <span>
              Kamyar Kamali · Portfolio
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
