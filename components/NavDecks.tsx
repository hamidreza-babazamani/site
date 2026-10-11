
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NavDecks() {
  const t = useTranslations("HomePage");
  const pathname = usePathname();

  const links = [
    {
      name: t("links.home"),
      path: "/" as const,
    },
    {
      name: t("links.services"),
      path: "/services" as const,
    },
    {
      name: t("links.resume"),
      path: "/resume" as const,
    },
    {
      name: t("links.profile"),
      path: "/profile" as const,
    },
    {
      name: t("links.work"),
      path: "/work" as const,
    },
    {
      name: t("links.contact"),
      path: "/contact" as const,
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="
        inline-flex items-center
        gap-1
        rounded-2xl
        border border-emerald-900/10
        bg-white/60
        p-1.5
        shadow-[0_5px_24px_rgba(15,118,110,0.04)]
        backdrop-blur-xl
        dark:border-white/10
        dark:bg-white/[0.035]
      "
    >
      {links.map((link) => {
        const active =
          link.path === "/"
            ? pathname === "/"
            : pathname === link.path ||
              pathname.startsWith(`${link.path}/`);

        return (
          <Link
            key={link.path}
            href={link.path}
            aria-current={active ? "page" : undefined}
            className={`
              group relative
              inline-flex min-h-10
              items-center justify-center
              whitespace-nowrap
              rounded-xl
              px-3.5 py-2.5
              text-[13px] font-medium
              transition-[color,background-color,box-shadow]
              duration-300
              outline-none
              focus-visible:ring-2
              focus-visible:ring-emerald-500/50
              xl:px-4
              xl:text-sm
              ${
                active
                  ? `
                    bg-emerald-500/10
                    text-emerald-800
                    shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]
                    dark:bg-emerald-400/10
                    dark:text-emerald-300
                  `
                  : `
                    text-slate-600
                    hover:bg-emerald-500/[0.06]
                    hover:text-emerald-800
                    dark:text-slate-300
                    dark:hover:bg-white/[0.06]
                    dark:hover:text-emerald-300
                  `
              }
            `}
          >
            <span className="relative z-10">
              {link.name}
            </span>

            {/* Active indicator */}
            {active && (
              <span
                aria-hidden="true"
                className="
                  absolute bottom-1
                  h-[3px] w-5
                  rounded-full
                  bg-gradient-to-r
                  from-emerald-500
                  to-cyan-500
                  dark:from-emerald-400
                  dark:to-cyan-400
                "
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
