
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, ChevronDown, Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  {
    code: "fa",
    label: "فارسی",
    flag: "/flags/flagiran.webp",
  },
  {
    code: "en",
    label: "English",
    flag: "/flags/flagamerican.png",
  },
] as const;

type Locale = (typeof languages)[number]["code"];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const current =
    languages.find((lang) => lang.code === locale) ??
    languages[0];

  const handleChangeLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    const query = searchParams.toString();
    const hash = window.location.hash;
    const suffix = `${query ? `?${query}` : ""}${hash}`;

    const isAdminRoute =
      pathname === "/admin" ||
      pathname.startsWith("/admin/");

    if (isAdminRoute) {
      // مسیر ادمین بدون پیشوند زبان باقی می‌ماند.
      document.cookie =
        `NEXT_LOCALE=${newLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

      window.location.assign(`${pathname}${suffix}`);
      return;
    }

    // پشتیبانی از مسیرهای دارای پیشوند و بدون پیشوند
    const segments = pathname.split("/");
    const hasLocalePrefix =
      segments[1] === "fa" || segments[1] === "en";

    const nextPath = hasLocalePrefix
      ? `/${newLocale}${pathname.slice(3) || ""}`
      : `/${newLocale}${pathname === "/" ? "" : pathname}`;

    router.replace(`${nextPath}${suffix}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            locale === "fa"
              ? "تغییر زبان سایت"
              : "Change website language"
          }
          className="
            group
            inline-flex h-10
            max-w-[155px]
            items-center justify-center
            gap-2
            rounded-xl
            border border-emerald-900/10
            bg-white/70
            px-3
            text-sm font-medium
            text-slate-700
            shadow-[0_4px_16px_rgba(15,118,110,0.04)]
            backdrop-blur-md
            outline-none
            transition-[color,background-color,border-color,box-shadow]
            duration-300
            hover:border-emerald-500/30
            hover:bg-emerald-50/80
            hover:text-emerald-800
            focus-visible:ring-2
            focus-visible:ring-emerald-500/50
            dark:border-white/10
            dark:bg-white/[0.05]
            dark:text-slate-200
            dark:hover:border-emerald-400/30
            dark:hover:bg-emerald-400/[0.08]
            dark:hover:text-emerald-200
            sm:h-11
            sm:px-3.5
          "
        >
          <Languages
            size={16}
            aria-hidden="true"
            className="
              shrink-0
              text-emerald-600
              dark:text-emerald-400
            "
          />

          <Image
            src={current.flag}
            alt=""
            width={20}
            height={20}
            className="
              h-[18px] w-[18px]
              shrink-0
              rounded-full
              object-cover
              ring-1 ring-slate-200
              dark:ring-white/15
            "
          />

          <span className="truncate">
            {current.label}
          </span>

          <ChevronDown
            size={14}
            aria-hidden="true"
            className="
              shrink-0
              text-slate-400
              transition-transform duration-200
              group-data-[state=open]:rotate-180
              dark:text-slate-500
            "
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="
          z-50
          min-w-[175px]
          rounded-2xl
          border border-emerald-900/10
          bg-white/95
          p-1.5
          text-slate-800
          shadow-[0_16px_45px_rgba(15,23,42,0.12)]
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-[#141c26]/95
          dark:text-slate-100
          dark:shadow-[0_16px_45px_rgba(0,0,0,0.4)]
        "
      >
        {languages.map((lang) => {
          const selected = locale === lang.code;

          return (
            <DropdownMenuItem
              key={lang.code}
              onSelect={() => handleChangeLocale(lang.code)}
              className={`
                flex cursor-pointer
                items-center gap-3
                rounded-xl
                px-3 py-2.5
                text-sm
                outline-none
                transition-colors
                focus:bg-emerald-500/10
                focus:text-emerald-800
                dark:focus:bg-emerald-400/10
                dark:focus:text-emerald-200
                ${
                  selected
                    ? "bg-emerald-500/10 font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "text-slate-700 dark:text-slate-300"
                }
              `}
            >
              <Image
                src={lang.flag}
                alt=""
                width={22}
                height={22}
                className="
                  h-5 w-5
                  shrink-0
                  rounded-full
                  object-cover
                  ring-1 ring-slate-200
                  dark:ring-white/15
                "
              />

              <span className="flex-1">
                {lang.label}
              </span>

              {selected && (
                <Check
                  size={16}
                  aria-hidden="true"
                  className="
                    shrink-0
                    text-emerald-600
                    dark:text-emerald-400
                  "
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
