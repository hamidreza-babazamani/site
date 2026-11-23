import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { PublicMedia } from "@/lib/services/public-portfolio";
import {
  DEFAULT_CONTACT_METHODS,
  getContactHoverClass,
  getContactIcon,
  resolveContactHref,
} from "@/lib/contact-methods";

const socialLinks = DEFAULT_CONTACT_METHODS.flatMap((item) => {
  const href = resolveContactHref(item);
  if (!href) return [];
  return [
    {
      name: item.label?.en || item.type,
      href,
      icon: getContactIcon(item.type),
      hover: getContactHoverClass(item.type),
      external: !href.startsWith("mailto:") && !href.startsWith("tel:"),
    },
  ];
});

export default function Footer({ siteLogo }: { siteLogo?: PublicMedia }) {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const footerLinks = [
    {
      label: t("footer.aboutme"),
      href: "/profile" as const,
    },
    {
      label: t("footer.project"),
      href: "/work" as const,
    },
    {
      label: t("footer.contact"),
      href: "/contact" as const,
    },
  ];

  return (
    <footer
      className="
        relative isolate overflow-hidden
        border-t border-emerald-900/10
        bg-[#f8fafc]
        text-slate-700
        dark:border-white/[0.07]
        dark:bg-[#0c1118]
        dark:text-slate-300
      "
    >
      {/* Decorative aurora */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="
            absolute -top-44 -start-32
            h-[350px] w-[350px]
            rounded-full
            bg-emerald-400/[0.09]
            blur-[100px]
            dark:bg-emerald-500/[0.07]
          "
        />

        <div
          className="
            absolute -bottom-52 -end-28
            h-[400px] w-[400px]
            rounded-full
            bg-cyan-400/[0.09]
            blur-[110px]
            dark:bg-cyan-500/[0.06]
          "
        />

        <div
          className="
            absolute inset-x-0 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-emerald-500/35
            to-transparent
          "
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div
          className="
            grid grid-cols-1
            gap-8
            py-10
            sm:gap-10 sm:py-14
            md:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr]
            lg:gap-14
            lg:py-16
          "
        >
          {/* Brand */}
          <div className="min-w-0 max-w-md">
            <Link
              href="/"
              aria-label="Hamidreza Babazamani - Home"
              className="
                group inline-flex items-center gap-3
                rounded-xl
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-emerald-500
              "
            >
              {siteLogo?.url && (
                <Image
                  src={siteLogo.url}
                  alt={siteLogo.alt?.[locale as "fa" | "en"] || "Website logo"}
                  width={220}
                  height={110}
                  priority
                  sizes="(max-width: 640px) 110px, (max-width: 1280px) 150px, 180px"
                  className="
                    h-auto w-[105px]
                    max-w-full object-contain
                    sm:w-[145px]
                    xl:w-[180px]
                    dark:brightness-110
                  "
                />
              )}

              <h2
                className="
                  text-xl font-bold
                  tracking-tight
                  text-slate-900
                  transition-colors duration-300
                  group-hover:text-emerald-700
                  dark:text-slate-100
                  dark:group-hover:text-emerald-300
                "
              >
                {t("footer.name")}
              </h2>
            </Link>

            <p
              className="
                mt-5 max-w-sm
                text-sm leading-8
                text-slate-600
                dark:text-slate-400
                sm:text-[15px]
              "
            >
              {t("footer.desc")}
            </p>

            {/* Decorative brand line */}
            <div
              aria-hidden="true"
              className="
                mt-6 h-[3px] w-14
                rounded-full
                bg-gradient-to-r
                from-emerald-500
                via-teal-400
                to-cyan-400
              "
            />
          </div>

          {/* Quick links */}
          <nav aria-label={t("footer.link")}>
            <h3
              className="
                mb-6 text-sm font-bold
                tracking-wide
                text-slate-900
                dark:text-slate-100
              "
            >
              {t("footer.link")}
            </h3>

            <ul className="space-y-4">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="
                      group inline-flex
                      items-center gap-2
                      text-sm font-medium
                      text-slate-600
                      transition-colors duration-300
                      hover:text-emerald-700
                      dark:text-slate-400
                      dark:hover:text-emerald-300
                      focus-visible:rounded
                      focus-visible:outline-2
                      focus-visible:outline-emerald-500
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="
                        h-1.5 w-1.5
                        rounded-full
                        bg-slate-300
                        transition-colors duration-300
                        group-hover:bg-emerald-500
                        dark:bg-slate-600
                        dark:group-hover:bg-emerald-400
                      "
                    />

                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social links */}
          <div>
            <h3
              className="
                mb-6 text-sm font-bold
                tracking-wide
                text-slate-900
                dark:text-slate-100
              "
            >
              {t("footer.medi")}
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noopener noreferrer" : undefined}
                    aria-label={social.name}
                    title={social.name}
                    className={`
                      group flex h-12 w-12
                      items-center justify-center
                      rounded-2xl
                      border border-slate-200/80
                      bg-white/70
                      text-slate-600
                      shadow-sm
                      backdrop-blur-sm
                      transition-[color,background-color,border-color,transform,box-shadow]
                      duration-300
                      hover:-translate-y-1
                      hover:border-emerald-500/25
                      hover:bg-white
                      hover:shadow-[0_8px_24px_rgba(15,118,110,0.10)]
                      dark:border-white/10
                      dark:bg-white/[0.04]
                      dark:text-slate-300
                      dark:hover:border-emerald-400/25
                      dark:hover:bg-white/[0.08]
                      dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-emerald-500
                      motion-reduce:transform-none
                      ${social.hover}
                    `}
                  >
                    <Icon aria-hidden="true" className="text-[19px]" />
                  </a>
                );
              })}
            </div>

            <a
              href="https://github.com/hamidreza-babazamani"
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-6 inline-flex max-w-full items-center
                gap-2 break-all text-xs font-medium
                text-slate-500
                transition-colors duration-300
                hover:text-emerald-700
                dark:text-slate-500
                dark:hover:text-emerald-300
              "
            >
              <span>github.com/hamidreza-babazamani</span>
              <ArrowUpRight size={14} className="shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
